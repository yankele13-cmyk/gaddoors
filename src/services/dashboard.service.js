import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getAggregateFromServer, 
  sum,
  count 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ORDER_STATUS } from '../config/constants';

const ORDERS_COLLECTION = 'orders';

export const dashboardService = {
  /**
   * aggregated stats for the dashboard.
   * Note: In a high-traffic production app, we would use Cloud Functions triggers
   * to maintain a 'stats_metadata' document incremented on every write.
   * For this scale, client-side aggregation of recent/active items is acceptable.
   */
  getStats: async () => {
    try {
        const ordersColl = collection(db, ORDERS_COLLECTION);

        // 1. AGGREGATION (Cost-Effective for Totals)
        // Calculates totals without downloading documents (Optimization)
        const snapshot = await getAggregateFromServer(ordersColl, {
            totalRevenue: sum('financials.totalGt'),
            totalDebt: sum('financials.balanceDue'), // Assuming this field exists and is maintained
            totalCount: count()
        });
        
        const { totalRevenue, totalDebt, totalCount } = snapshot.data();

        // 2. Fetch RECENT Orders for Charts & Table (Limit 50 to save reads)
        // We use this sample for the "Monthly Trend" chart. 
        // Note: For 100% accurate charts over years, we'd need a separate 'stats/monthly' doc.
        // For now, charts show "Recent Trend".
        const recentQ = query(ordersColl, orderBy('createdAt', 'desc'), limit(50));
        const recentSnap = await getDocs(recentQ);
        const recentOrders = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Calc Sub-stats from Recent (Active Leads, Installations)
        // Ideally these should be specific Queries using count() but we save reads by reusing the recent list if they are active.
        // Better approach: Separate cheap Count queries.
        
        // Count Active Leads (Drafts)
        const leadsQ = query(ordersColl, where('status', '==', ORDER_STATUS.DRAFT));
        const leadsSnap = await getAggregateFromServer(leadsQ, { count: count() });
        
        // Count Installations Scheduled
        const installQ = query(ordersColl, where('status', '==', ORDER_STATUS.INSTALLATION_SCHEDULED));
        const installSnap = await getAggregateFromServer(installQ, { count: count() });

        // Chart Data (from recent 50)
        const monthlySales = {};
        recentOrders.forEach(order => {
             if (order.createdAt?.seconds && order.financials?.totalGt) {
                const date = new Date(order.createdAt.seconds * 1000);
                const monthKey = date.toLocaleString('fr-FR', { month: 'short' });
                monthlySales[monthKey] = (monthlySales[monthKey] || 0) + order.financials.totalGt;
            }
        });

        return {
            revenue: totalRevenue || 0,
            debt: totalDebt || 0,
            activeLeads: leadsSnap.data().count || 0,
            upcomingInstallations: installSnap.data().count || 0,
            monthlySales,
            recentOrders: recentOrders.slice(0, 5) // Top 5
        };

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        // Fallback to zero if aggregation fails (e.g. missing index)
        return {
            revenue: 0,
            debt: 0,
            activeLeads: 0,
            upcomingInstallations: 0,
            monthlySales: {},
            recentOrders: []
        };
    }
  }
};
