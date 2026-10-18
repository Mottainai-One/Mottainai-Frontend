import assert from "node:assert/strict";
import test from "node:test";
import {
  sanitizeEmployeeForm,
  validateEmployeeForm,
} from "../src/utils/employeeFormValidation.ts";
import {
  sanitizeLoginCredentials,
  validateLoginCredentials,
} from "../src/utils/loginValidation.ts";
import {
  sanitizeProductDraft,
  validateProductDraft,
} from "../src/utils/productImportValidation.ts";
import {
  sanitizeStockAdjustmentForm,
  validateStockAdjustmentForm,
} from "../src/utils/stockAdjustmentValidation.ts";
import {
  sanitizeStockCountBarcode,
  validateStockCountBarcode,
} from "../src/utils/stockCountValidation.ts";
import {
  sanitizeManagementReportFilters,
  validateManagementReportFilters,
} from "../src/utils/managementReportValidation.ts";
import {
  sanitizeMonthlyFinancialReportFilters,
  validateMonthlyFinancialReportFilters,
} from "../src/utils/monthlyFinancialReportValidation.ts";
import {
  sanitizeSupplierForm,
  validateSupplierForm,
} from "../src/utils/supplierFormValidation.ts";
import {
  sanitizeTransferForm,
  validateTransferForm,
} from "../src/utils/transferFormValidation.ts";
import {
  sanitizeNewPassword,
  sanitizeRecoveryCode,
  sanitizeRecoveryEmail,
  validateNewPassword,
  validateRecoveryCode,
  validateRecoveryEmail,
} from "../src/utils/passwordRecoveryValidation.ts";

test("employee form reports field-specific errors and sanitizes values", () => {
  const draft = {
    name: "  Ana Silva  ", cpf: "123.456.789-01", role: "Gerente",
    store: " Loja Centro ", phone: "(11) 91234-5678", email: " ana@example.com ", status: "Ativo",
  };
  assert.deepEqual(validateEmployeeForm(draft), {});
  assert.equal(sanitizeEmployeeForm(draft).name, "Ana Silva");
  assert.equal(sanitizeEmployeeForm(draft).cpf, "12345678901");
  assert.equal(validateEmployeeForm({ ...draft, cpf: "123", email: "inválido" }).cpf, "Informe um CPF com 11 dígitos.");
  assert.equal(validateEmployeeForm({ ...draft, cpf: "123", email: "inválido" }).email, "Informe um e-mail válido.");
});

test("login validation trims email but preserves password exactly", () => {
  assert.deepEqual(validateLoginCredentials({ email: "", password: "" }), {
    email: "Informe seu e-mail.", password: "Informe sua senha.",
  });
  assert.deepEqual(validateLoginCredentials({ email: "admin@123", password: "valid" }), {});
  assert.ok(validateLoginCredentials({ email: "pessoa@example.com", password: "x".repeat(129) }).password);
  assert.deepEqual(sanitizeLoginCredentials({ email: " pessoa@example.com ", password: "  segredo  " }), {
    email: "pessoa@example.com", password: "  segredo  ",
  });
});

test("product validation catches required fields and trims bounded text", () => {
  const draft = {
    sku: " SKU-1 ", barcode: " 123 ", name: " Arroz ", category: " Grãos ",
    brand: " Marca ", measurementUnit: " kg ", supplier: " Fornecedor ",
  };
  assert.deepEqual(validateProductDraft(draft), {});
  assert.equal(sanitizeProductDraft(draft).name, "Arroz");
  assert.ok(validateProductDraft({ ...draft, name: " " }).name);
  assert.equal(sanitizeProductDraft({ ...draft, name: "x".repeat(140) }).name.length, 120);
});

test("stock adjustment rejects invalid quantities and sanitizes observations", () => {
  const form = { product: " Produto ", quantity: "2", type: "Avaria", observation: " Nota ", responsible: " Joana " };
  assert.deepEqual(validateStockAdjustmentForm(form), {});
  assert.equal(validateStockAdjustmentForm({ ...form, quantity: "0" }).quantity, "Informe uma quantidade numérica maior que zero.");
  assert.equal(sanitizeStockAdjustmentForm(form).responsible, "Joana");
});

test("stock count requires scope and barcode, then bounds the sanitized barcode", () => {
  assert.ok(validateStockCountBarcode({ scope: "", barcode: "" }).scope);
  assert.ok(validateStockCountBarcode({ scope: "Laticínios", barcode: "" }).barcode);
  assert.equal(sanitizeStockCountBarcode(` ${"1".repeat(60)} `).length, 50);
});

test("management and monthly report filters validate required selections", () => {
  assert.deepEqual(validateManagementReportFilters({ date: "", store: "", category: "" }), {
    date: "Selecione o período.", store: "Selecione a loja.", category: "Selecione a categoria.",
  });
  assert.deepEqual(sanitizeManagementReportFilters({ date: " mês ", store: " Loja ", category: " Categoria " }), {
    date: "mês", store: "Loja", category: "Categoria",
  });
  assert.ok(validateMonthlyFinancialReportFilters({ month: "13", store: "Loja" }).month);
  assert.deepEqual(validateMonthlyFinancialReportFilters({ month: "05", store: "Loja" }), {});
});

test("supplier and transfer validators reject invalid domain selections", () => {
  const supplier = { addressId: "", tradeName: "Fornecedor", cnpj: "123", email: "", phone: "", active: true };
  assert.ok(validateSupplierForm(supplier).addressId);
  assert.ok(validateSupplierForm(supplier).cnpj);
  assert.equal(sanitizeSupplierForm({ ...supplier, tradeName: " Fornecedor " }).tradeName, "Fornecedor");

  const transfer = {
    employeeId: "1", sourceStoreId: "store-a", destinationStoreId: "store-a",
    requestDate: "2026-05-10", completionDate: "2026-05-09", suggestedActionId: "", observation: " nota ",
  };
  assert.ok(validateTransferForm(transfer).destinationStoreId);
  assert.ok(validateTransferForm(transfer).completionDate);
  assert.equal(sanitizeTransferForm(transfer).observation, "nota");
});

test("recovery forms validate email, recovery code and matching password", () => {
  assert.ok(validateRecoveryEmail("ruim"));
  assert.equal(validateRecoveryEmail(" pessoa@example.com "), null);
  assert.equal(sanitizeRecoveryEmail(" pessoa@example.com "), "pessoa@example.com");
  assert.ok(validateRecoveryCode("123"));
  assert.equal(validateRecoveryCode("123456"), null);
  assert.equal(sanitizeRecoveryCode("1a2b3c4d5e6f7"), "123456");
  assert.ok(validateNewPassword("curta", "curta").password);
  assert.ok(validateNewPassword("senha-valida", "diferente").passwordConfirmation);
  assert.deepEqual(validateNewPassword("senha-valida", "senha-valida"), {});
  assert.equal(sanitizeNewPassword(" x "), " x ");
});
