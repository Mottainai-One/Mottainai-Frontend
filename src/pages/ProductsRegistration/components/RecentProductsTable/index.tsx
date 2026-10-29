import ReusableTable from "@/components/ReusableTable";
import type { ReusableTableColumn } from "@/types/reusable-table.types";
import type { RecentProduct } from "@/types/product-import.types";
import type { RecentProductsTableProps } from "@/types/product-registration-ui.types";

const columns: ReusableTableColumn<RecentProduct>[] = [
  { id: "item", header: "Produto", renderCell: (item) => item.itemName },
  { id: "barcode", header: "Código de barras", renderCell: (item) => item.barcode },
  { id: "category", header: "Categoria", renderCell: (item) => item.category },
  { id: "quantity", header: "Quantidade", renderCell: (item) => item.quantity },
  { id: "source", header: "Origem", renderCell: (item) => item.source },
  { id: "addedAt", header: "Adicionado em", renderCell: (item) => item.addedAt },
];

function RecentProductsTable({ products }: RecentProductsTableProps) {
  return (
    <ReusableTable
      title="Últimos produtos adicionados"
      columns={columns}
      data={products}
      rowKey={(item) => item.id}
    />
  );
}

export default RecentProductsTable;
