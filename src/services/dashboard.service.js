import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
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
    // 1. Fetch Orders to calculate Revenue & Debt
    // We fetch all non-cancelled orders to aggregate revenue. 
    // Optimization: In real app, date filter (e.g., this year).
    const ordersQ = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'), limit(100));
    const ordersSnap = await getDocs(ordersQ);
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let revenue = 0;
    let debt = 0;
    const monthlySales = {};

    orders.forEach(order => {
        // Revenue: Total of verified or paid orders (Assumed 'VALIDATED' or 'PRODUCTION' implies authorized payment)
        // Simplification: We sum 'totalGt' of validated/production/completed/installed.
        // Debt: We check financials.balanceDue if available, or assume full price if not paid.
        
        const isValidSale = [
            ORDER_STATUS.VALIDATED, 
            ORDER_STATUS.PRODUCTION, 
            ORDER_STATUS.INSTALLATION_SCHEDULED,
            ORDER_STATUS.COMPLETED
        ].includes(order.status);

        if (isValidSale) {
            revenue += (order.financials?.totalGt || 0);
            debt += (order.financials?.balanceDue || 0); // Assuming balanceDue is tracked
        }

        // Monthly Sales Chart
        if (order.createdAt?.seconds) {
            const date = new Date(order.createdAt.seconds * 1000);
            const monthKey = date.toLocaleString('fr-FR', { month: 'short' });
            monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (order.financials?.totalGt || 0);
        }
    });

    // 2. Count Active Leads
    // Leads are essentially Draft orders or specifically marked leads?
    // Based on CRMService usage, likely 'draft' orders or a separate leads collection.
    // We'll count 'DRAFT' orders as Leads for now.
    const leadsCount = orders.filter(o => o.status === ORDER_STATUS.DRAFT).length;

    // 3. Upcoming Installations
    // Count orders in 'INSTALLATION_SCHEDULED'
    const installationsCount = orders.filter(o => o.status === ORDER_STATUS.INSTALLATION_SCHEDULED).length;

    return {
        revenue,
        debt,
        activeLeads: leadsCount,
        upcomingInstallations: installationsCount,
        monthlySales,
        recentOrders: orders.slice(0, 5)
    };
  }
};
