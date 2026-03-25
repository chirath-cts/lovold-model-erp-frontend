import { mockDb } from "@/services/mock/mockDb";

export const businessSettingsService = {
  get() {
    return mockDb.getBusinessSettings();
  },
  update(payload: { qualityCheckLeadDays?: number; packagingLeadDays?: number }) {
    return mockDb.updateBusinessSettings(payload);
  },
};
