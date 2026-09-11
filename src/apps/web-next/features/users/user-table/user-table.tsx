"use client";

import { flexRender, tableFeatures, useTable } from "@tanstack/react-table";

import { useUiStore } from "../../../shared/stores";
import { Table } from "../../../shared/ui";

import type { UserResponse } from "../user.types";
import type { ColumnDef } from "@tanstack/react-table";

const TABLE_FEATURES = tableFeatures({});
const USER_COLUMNS: ColumnDef<typeof TABLE_FEATURES, UserResponse>[] = [
  { accessorKey: "displayName", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "id", header: "ID" },
];

export function UserTable({ users }: { readonly users: readonly UserResponse[] }) {
  const density = useUiStore((state) => state.density);
  const table = useTable({ columns: USER_COLUMNS, data: users, features: TABLE_FEATURES });

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className={density === "compact" ? "text-xs" : "text-sm"}>
        <caption className="sr-only">Users in the selected organization</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="h-10 px-3 text-left font-medium" key={header.id} scope="col">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="border-t" key={row.id}>
              {row.getAllCells().map((cell) => (
                <td className="px-3 py-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
