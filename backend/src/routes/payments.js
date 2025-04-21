const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/authenticate');
const { checkPermission } = require('../middleware/permissions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    
    res.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

// Get user's current subscription
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.userId;
    
    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ message: 'Failed to fetch user subscription' });
  }
});

// Create checkout session for subscription
router.post('/create-checkout-session', async (req, res) => {
  try {
    const userId = req.userId;
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100), // Convert to cents
            recurring: {
              interval: plan.billingInterval.toLowerCase(),
              interval_count: 1
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        planId: planId
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Extract metadata
      const userId = session.metadata.userId;
      const planId = session.metadata.planId;
      
      try {
        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId,
            planId,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: null
          }
        });
        
        // Update user role to paid user
        const paidUserRole = await prisma.role.findFirst({
          where: { name: 'PAID_USER' }
        });
        
        if (paidUserRole) {
          // Check if user already has the role
          const existingUserRole = await prisma.userRole.findFirst({
            where: {
              userId,
              roleId: paidUserRole.id
            }
          });
          
          if (!existingUserRole) {
            await prisma.userRole.create({
              data: {
                userId,
                roleId: paidUserRole.id
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing subscription:', error);
      }
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      
      try {
        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE'
          }
        });
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
      break;
      
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      
      try {
        // Update subscription status and end date
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: canceledSubscription.id },
          data: {
            status: 'CANCELED',
            endDate: new Date(canceledSubscription.canceled_at * 1000)
          }
        });
        
        // Get user ID from subscription
        const userSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: canceledSubscription.id }
        });
        
        if (userSubscription) {
          // Check if user has any active subscriptions
          const activeSubscriptions = await prisma.subscription.count({
            where: {
              userId: userSubscription.userId,
              status: 'ACTIVE',
              NOT: {
                id: userSubscription.id
              }
            }
          });
          
          // If no active subscriptions, downgrade user role
          if (activeSubscriptions === 0) {
            const paidUserRole = await prisma.role.findFirst({
              where: { name: 'PAID_USER' }
            });
            
            if (paidUserRole) {
              await prisma.userRole.deleteMany({
                where: {
                  userId: userSubscription.userId,
                  roleId: paidUserRole.id
                }
              });
            }
            
            // Add free user role if not already present
            const freeUserRole = await prisma.role.findFirst({
              where: { name: 'FREE_USER' }
            });
            
            if (freeUserRole) {
              const existingFreeRole = await prisma.userRole.findFirst({
                where: {
                  userId: userSubscription.userId,
                  roleId: freeUserRole.id
                }
              });
              
              if (!existingFreeRole) {
                await prisma.userRole.create({
                  data: {
                    userId: userSubscription.userId,
                    roleId: freeUserRole.id
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
      }
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      
      try {
        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: failedInvoice.subscription },
          data: {
            status: 'PAYMENT_FAILED'
          }
        });
      } catch (error) {
        console.error('Error handling failed payment:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Cancel subscription
router.post('/cancel-subscription', checkPermission('subscriptions:write'), async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ message: 'Subscription ID is required' });
    }
    
    // Get subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    
    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        endDate: new Date()
      }
    });
    
    res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Get billing history
router.get('/billing-history', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get user's Stripe customer ID from the most recent subscription
    const latestSubscription = subscriptions[0];
    
    if (!latestSubscription || !latestSubscription.stripeCustomerId) {
      return res.json({ invoices: [] });
    }
    
    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: latestSubscription.stripeCustomerId,
      limit: 100
    });
    
    res.json({ invoices: invoices.data });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ message: 'Failed to fetch billing history' });
  }
});

// Update payment method
router.post('/update-payment-method', checkPermission('subscriptions:write'), async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    // Create a SetupIntent for updating the payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: subscription.stripeCustomerId,
      payment_method_types: ['card'],
    });
    
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ message: 'Failed to create setup intent' });
  }
});

module.exports = router;
