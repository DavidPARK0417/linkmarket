/**
 * @file components/wholesaler/Orders/OrderTable.tsx
 * @description 주문 테이블 컴포넌트
 *
 * TanStack Table을 사용한 주문 목록 테이블입니다.
 * 체크박스 선택 및 일괄 상태 변경 기능을 포함합니다.
 *
 * @dependencies
 * - @tanstack/react-table
 * - components/ui/table.tsx
 * - components/ui/checkbox.tsx
 * - components/wholesaler/Orders/OrderStatusBadge.tsx
 */

"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderDetail } from "@/types/order";
import type { OrderStatus } from "@/types/database";

interface OrderTableProps {
  orders: OrderDetail[];
  isLoading?: boolean;
  onBatchStatusChange?: (orderIds: string[], status: OrderStatus) => void;
  isBatchProcessing?: boolean;
}

export default function OrderTable({
  orders,
  isLoading = false,
  onBatchStatusChange,
  isBatchProcessing = false,
}: OrderTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // 선택된 주문 ID 배열
  const selectedOrderIds = React.useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => orders[parseInt(key)]?.id)
      .filter(Boolean) as string[];
  }, [rowSelection, orders]);

  // 일괄 접수 확인 핸들러
  const handleBatchConfirm = () => {
    if (selectedOrderIds.length === 0) return;
    if (!onBatchStatusChange) return;

    const confirmed = window.confirm(
      `선택한 ${selectedOrderIds.length}개의 주문을 접수 확인 처리하시겠습니까?`,
    );

    if (confirmed) {
      onBatchStatusChange(selectedOrderIds, "confirmed");
      // 선택 초기화
      setRowSelection({});
    }
  };

  // 일괄 출고 처리 핸들러
  const handleBatchShip = () => {
    if (selectedOrderIds.length === 0) return;
    if (!onBatchStatusChange) return;

    const confirmed = window.confirm(
      `선택한 ${selectedOrderIds.length}개의 주문을 출고 처리하시겠습니까?`,
    );

    if (confirmed) {
      onBatchStatusChange(selectedOrderIds, "shipped");
      // 선택 초기화
      setRowSelection({});
    }
  };

  const columns: ColumnDef<OrderDetail>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="전체 선택"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="행 선택"
            disabled={
              row.original.status === "completed" ||
              row.original.status === "cancelled"
            }
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "order_number",
        header: "주문번호",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("order_number")}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "주문일",
        cell: ({ row }) => {
          const date = new Date(row.getValue("created_at"));
          return format(date, "yyyy-MM-dd HH:mm", { locale: ko });
        },
      },
      {
        accessorKey: "product",
        header: "상품명",
        cell: ({ row }) => {
          const product = row.original.product;
          return <div className="font-medium">{product?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "variant",
        header: "옵션",
        cell: ({ row }) => {
          const variant = row.original.variant;
          return <div>{variant?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "quantity",
        header: "수량",
        cell: ({ row }) => {
          return <div className="text-center">{row.getValue("quantity")}</div>;
        },
      },
      {
        accessorKey: "total_amount",
        header: "금액",
        cell: ({ row }) => {
          const amount = row.getValue("total_amount") as number;
          return (
            <div className="text-right font-medium">
              {new Intl.NumberFormat("ko-KR").format(amount)}원
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
          return <OrderStatusBadge status={row.getValue("status")} />;
        },
      },
      {
        id: "actions",
        header: "액션",
        cell: ({ row }) => {
          return (
            <Link href={`/wholesaler/orders/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                상세보기
              </Button>
            </Link>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: (row) => {
      // 완료/취소된 주문은 선택 불가
      return (
        row.original.status !== "completed" &&
        row.original.status !== "cancelled"
      );
    },
    state: {
      sorting,
      rowSelection,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">주문이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 일괄 처리 버튼 */}
      {selectedOrderIds.length > 0 && onBatchStatusChange && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
          <span className="text-sm font-medium">
            {selectedOrderIds.length}개 선택됨
          </span>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleBatchConfirm}
              disabled={isBatchProcessing}
            >
              {isBatchProcessing ? "처리 중..." : "일괄 접수 확인"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBatchShip}
              disabled={isBatchProcessing}
            >
              {isBatchProcessing ? "처리 중..." : "일괄 출고 처리"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : (header.column.columnDef.header as React.ReactNode)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.renderValue() as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
