import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'experiments',
      component: () => import('../views/ExperimentList.vue'),
      meta: { title: 'Experiments' },
    },
    {
      path: '/experiments/:id',
      name: 'experiment-detail',
      component: () => import('../views/ExperimentDetail.vue'),
      meta: { title: 'Experiment Detail' },
    },
    {
      path: '/experiments/create',
      name: 'experiment-create',
      component: () => import('../views/ExperimentCreate.vue'),
      meta: { title: 'Create Experiment' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title ?? 'App'} | A/B Testing`
  next()
})

export default router
