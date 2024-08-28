import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ColumnDropdown from './ColumnDropdown';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from "@mui/material/Tooltip";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const API_URL = "https://jsonplaceholder.typicode.com/users";

export default function DataTable() {
  const [columns, setColumns] = useState([
    { name: "Name", key: "name", visible: true, sortable: true },
    { name: "Email", key: "email", visible: true, sortable: true },
    { name: "Phone", key: "phone", visible: true, sortable: true },
    { name: "Website", key: "website", visible: true, sortable: true },
  ]);

  const [initialColumns, setInitialColumns] = useState([...columns]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        setData(result);
        toast.success('Data fetched successfully!');
      } catch (error) {
        toast.error('Error fetching data!');
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleColumnChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowCheckboxChange = (rowIndex) => {
    const selectedIndex = selectedRows.indexOf(rowIndex);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, rowIndex);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = paginatedData.map(
        (_, index) => (currentPage - 1) * rowsPerPage + index
      );
      setSelectedRows(selectedRows.concat(newSelecteds));
    } else {
      const newSelecteds = selectedRows.filter(
        (index) =>
          !(
            index >= (currentPage - 1) * rowsPerPage &&
            index < currentPage * rowsPerPage
          )
      );
      setSelectedRows(newSelecteds);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (rowIndex, key, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][key] = value;
    setData(updatedData);
  };

  const sortedData = React.useMemo(() => {
    if (sortConfig.key) {
      return [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  }, [data, sortConfig]);

  const filteredData = sortedData.filter((row) =>
    columns.some((col) =>
      row[col.key].toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  const isSelected = (rowIndex) => selectedRows.indexOf(rowIndex) !== -1;

  const allRowsSelected =
    paginatedData.length > 0 &&
    paginatedData.every((_, index) =>
      isSelected((currentPage - 1) * rowsPerPage + index)
    );

  const toggleColumnDropdown = () => {
    setShowColumnDropdown(!showColumnDropdown);
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const updatedColumns = Array.from(columns);
    const [movedColumn] = updatedColumns.splice(result.source.index, 1);
    updatedColumns.splice(result.destination.index, 0, movedColumn);
    setColumns(updatedColumns);
  };

  const handleRefresh = () => {
    setColumns(initialColumns);
  };

  return (
    <div className="max-w-full mx-auto bg-white p-6 rounded-lg overflow-x-auto relative">
      <ToastContainer />
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#1995AD] mb-2">Dashboard</h2>
        <p className="text-gray-600 mb-4">Manage your columns.</p>
        <div className="flex items-center mb-4">
          <Tooltip title="Refresh">
            <button onClick={handleRefresh} className="mr-2 text-gray-500 hover:text-gray-700">
              <RefreshIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip title="Column Management">
            <button onClick={toggleColumnDropdown} className="mr-2 text-gray-500 hover:text-gray-700">
              <ViewWeekOutlinedIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="p-2 border border-gray-300 rounded-md"
            />
            <SearchIcon className="w-5 h-5 absolute right-2 top-2 text-gray-500" />
          </div>
        </div>
        {showColumnDropdown && (
          <ColumnDropdown
            columns={columns}
            handleColumnChange={handleColumnChange}
            handleClose={() => setShowColumnDropdown(false)}
          />
        )}
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided) => (
                <div
                  className="flex"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {columns.map((column, index) =>
                    column.visible ? (
                      <Draggable
                        key={column.key}
                        draggableId={column.key}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-2 border border-gray-300 rounded-md bg-gray-100 mr-2"
                          >
                            <div className="flex items-center">
                              <span className="font-bold">{column.name}</span>
                              {column.sortable && (
                                <div className="ml-2 flex space-x-1">
                                  <ArrowUpwardIcon
                                    className={`cursor-pointer ${
                                      sortConfig.key === column.key && sortConfig.direction === 'asc'
                                        ? 'text-blue-500'
                                        : ''
                                    }`}
                                    onClick={() => handleSort(column.key)}
                                  />
                                  <ArrowDownwardIcon
                                    className={`cursor-pointer ${
                                      sortConfig.key === column.key && sortConfig.direction === 'desc'
                                        ? 'text-blue-500'
                                        : ''
                                    }`}
                                    onClick={() => handleSort(column.key)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ) : null
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <table className="min-w-full mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th>
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    onChange={(e) => handleSelectAllClick(e.target.checked)}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </th>
                {columns
                  .filter((col) => col.visible)
                  .map((col) => (
                    <th key={col.key} className="p-2 border border-gray-300">
                      {col.name}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`cursor-pointer ${
                      isSelected((currentPage - 1) * rowsPerPage + rowIndex) ? 'bg-gray-100' : ''
                    }`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected((currentPage - 1) * rowsPerPage + rowIndex)}
                        onChange={() => handleRowCheckboxChange((currentPage - 1) * rowsPerPage + rowIndex)}
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    {columns
                      .filter((col) => col.visible)
                      .map((col) => (
                        <td key={col.key} className="p-2 border border-gray-300">
                          {row[col.key]}
                        </td>
                      ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.filter((col) => col.visible).length + 1} className="p-2 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {pageCount}
          </span>
          <button
            disabled={currentPage >= pageCount}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
