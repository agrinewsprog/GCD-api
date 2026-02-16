import { Router } from 'express';
import authRoutes from './auth.routes';
import companiesRoutes from './companies.routes';
import contactsRoutes from './contacts.routes';
import mediumsRoutes from './mediums.routes';
import channelsRoutes from './channels.routes';
import actionsRoutes from './actions.routes';
import campaignsRoutes from './campaigns.routes';
import installmentsRoutes from './installments.routes';
import newsletterRoutes from './newsletter.routes';
import magazineRoutes from './magazine.routes';
import magazineDeadlinesRoutes from './magazineDeadlines.routes';
import usersRoutes from './users.routes';
import workflowRoutes from './workflow.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
router.use('/auth', authRoutes);
router.use('/companies', companiesRoutes);
router.use('/contacts', contactsRoutes);
router.use('/mediums', mediumsRoutes);
router.use('/channels', channelsRoutes);
router.use('/actions', actionsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/installments', installmentsRoutes);
router.use('/newsletters', newsletterRoutes);
router.use('/magazines', magazineRoutes);
router.use('/magazine-deadlines', magazineDeadlinesRoutes);
router.use('/users', usersRoutes);
router.use('/workflow', workflowRoutes);

export default router;
