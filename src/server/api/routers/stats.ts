import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const statsRouter = createTRPCRouter({
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalAccounts,
      totalEmails,
      activeSubscriptions
    ] = await Promise.all([
      // Get total users
      ctx.db.user.count(),
      // Get total email accounts
      ctx.db.account.count(),
      // Get total emails
      ctx.db.email.count(),
      // Get active subscriptions
      ctx.db.stripeSubscription.count({
        where: {
          currentPeriodEnd: {
            gt: new Date()
          }
        }
      })
    ]);

    return {
      stats: [
        { number: totalUsers.toLocaleString(), label: "Active Users" },
        { number: totalAccounts.toLocaleString(), label: "Email Accounts" },
        { number: totalEmails.toLocaleString(), label: "Emails Processed" },
        { number: activeSubscriptions.toLocaleString(), label: "Pro Subscribers" }
      ]
    };
  }),
});