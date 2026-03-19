import { createCategoryRepository } from "../repositories/categoryRepository.js";
import { createCustomerProductRepository } from "../repositories/customerProductRepository.js";
import { createCustomerRepository } from "../repositories/customerRepository.js";
import { createHealthRepository } from "../repositories/healthRepository.js";
import { createOrderItemRepository } from "../repositories/orderItemRepository.js";
import { createOrderRepository } from "../repositories/orderRepository.js";
import { createProductRepository } from "../repositories/productRepository.js";
import { createSupplierRepository } from "../repositories/supplierRepository.js";
import { createUserRepository } from "../repositories/userRepository.js";
import { createWarehouseProductRepository } from "../repositories/warehouseProductRepository.js";
import { createWarehouseRepository } from "../repositories/warehouseRepository.js";
import { createAuthService } from "../services/authService.js";
import { createCategoryService } from "../services/categoryService.js";
import { createCustomerService } from "../services/customerService.js";
import { createDiscountService } from "../services/discountService.js";
import { createHealthService } from "../services/healthService.js";
import { createOrderItemService } from "../services/orderItemService.js";
import { createOrderService } from "../services/orderService.js";
import { createProductService } from "../services/productService.js";
import { createSupplierService } from "../services/supplierService.js";
import { createUserService } from "../services/userService.js";
import { createWarehouseProductService } from "../services/warehouseProductService.js";
import { createWarehouseService } from "../services/warehouseService.js";

export function createDependencies({ db }) {
  const categoryRepository = createCategoryRepository(db);
  const customerProductRepository = createCustomerProductRepository(db);
  const customerRepository = createCustomerRepository(db);
  const healthRepository = createHealthRepository(db);
  const orderItemRepository = createOrderItemRepository(db);
  const orderRepository = createOrderRepository(db);
  const productRepository = createProductRepository(db);
  const supplierRepository = createSupplierRepository(db);
  const userRepository = createUserRepository(db);
  const warehouseProductRepository = createWarehouseProductRepository(db);
  const warehouseRepository = createWarehouseRepository(db);

  return {
    services: {
      authService: createAuthService({ userRepository }),
      categoryService: createCategoryService({ categoryRepository }),
      customerService: createCustomerService({ customerRepository }),
      discountService: createDiscountService({
        customerProductRepository,
        customerRepository,
        productRepository,
      }),
      healthService: createHealthService({ healthRepository }),
      orderItemService: createOrderItemService({
        orderItemRepository,
        orderRepository,
        productRepository,
      }),
      orderService: createOrderService({ customerRepository, orderRepository }),
      productService: createProductService({
        categoryRepository,
        productRepository,
        warehouseRepository,
      }),
      supplierService: createSupplierService({ supplierRepository }),
      userService: createUserService({ userRepository }),
      warehouseProductService: createWarehouseProductService({
        warehouseProductRepository,
      }),
      warehouseService: createWarehouseService({ warehouseRepository }),
    },
  };
}
