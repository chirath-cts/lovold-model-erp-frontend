export function createHealthService({ healthRepository }) {
  return {
    async getHealth() {
      const counts = await healthRepository.countCustomers();
      return { ok: true, customers: counts?.customers ?? 0 };
    },
  };
}
