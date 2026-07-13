
import { PRODUCTION_BASELINE } from '@/data/productionBaseline';

export function bootstrapProductionData() {
  Object.entries(PRODUCTION_BASELINE).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, String(value));
    }
  });
}

