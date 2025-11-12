/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
import React from "react";
import "./css/table.css";

const CustomTable = ({ columns, dataSource, height }) => {
  return (
    <div className="custom-table" style={{ height }}>
      <div className="custom-table-header">
        {columns.map((col) => (
          <div
            key={col.key}
            className="custom-table-cell"
            style={{ flex: col.width ? `0 0 ${col.width}px` : 1 }}
          >
            {col.title}
          </div>
        ))}
      </div>

      <div className="custom-table-body">
        {dataSource.length === 0 ? (
          <div className="empty">请选择文件</div>
        ) : (
          dataSource.map((row) => (
            <div key={row.uid} className="custom-table-row">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="custom-table-cell"
                  style={{ flex: col.width ? `0 0 ${col.width}px` : 1 }}
                >
                  {col.render
                    ? col.render(row[col.dataIndex], row)
                    : row[col.dataIndex] || "-"}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomTable;
