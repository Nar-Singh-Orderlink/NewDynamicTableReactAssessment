import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  RefreshIcon,
  DownloadIcon,
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

export default function Waitlist() {
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
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search client"
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Tooltip title="Reset Column">
            <button
              className="px-3 py-1 bg-white rounded-md text-gray-700 hover:bg-gray-100"
              onClick={handleRefresh}
            >
              <RefreshIcon className="w-5 h-5 text-[#1995AD]" />
            </button>
          </Tooltip>

          <Tooltip title="Edit Columns">
            <button
              className="px-3 py-1 bg-white rounded-md text-gray-700 hover:bg-gray-100"
              onClick={toggleColumnDropdown}
            >
              <ViewWeekOutlinedIcon className="w-5 h-5 text-[#1995AD]" />
            </button>
          </Tooltip>

          {showColumnDropdown && (
            <ColumnDropdown
              columns={columns}
              handleColumnChange={handleColumnChange}
              handleClose={toggleColumnDropdown}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided) => (
              <table className="w-full bg-white border border-gray-300">
                <thead
                  className="h-12 bg-gradient-to-r from-[#A1D6E2] to-[#1995AD] text-white"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <tr>
                    <th className="border-b py-2 px-4 border-gray-300 font-semibold w-1">
                      <input
                        type="checkbox"
                        checked={allRowsSelected}
                        onChange={(e) => handleSelectAllClick(e.target.checked)}
                      />
                    </th>
                    {columns.map((col, index) =>
                      col.visible ? (
                        <Draggable key={col.key} draggableId={col.key} index={index}>
                          {(provided) => (
                            <th
                              className="relative text-left border-b border-gray-300 font-semibold cursor-pointer"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => col.sortable && handleSort(col.key)}
                            >
                              {col.name}
                              {sortConfig.key === col.key && (
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  {sortConfig.direction === 'asc' ? (
                                    <ArrowUpwardIcon className="text-black-500" />
                                  ) : (
                                    <ArrowDownwardIcon className="text-black-500" />
                                  )}
                                </span>
                              )}
                              <span className="absolute inset-0"></span>
                            </th>
                          )}
                        </Draggable>
                      ) : null
                    )}
                    {provided.placeholder}
                  </tr>
                </thead>
                <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${isSelected((currentPage - 1) * rowsPerPage + rowIndex)
                  ? "bg-gray-200"
                  : ""
                  }`}
              >
                <td className="border-b py-2 px-4 border-gray-300 font-semibold w-1">
                  <input
                    type="checkbox"
                    checked={isSelected(
                      (currentPage - 1) * rowsPerPage + rowIndex
                    )}
                    onChange={() =>
                      handleRowCheckboxChange(
                        (currentPage - 1) * rowsPerPage + rowIndex
                      )
                    }
                  />
                </td>
                {columns.map(
                  (col) =>
                    col.visible && (
                      <td
                        key={col.key}
                        className="py-2 border-b border-gray-300"
                      >
                        <input
                          type="text"
                          value={row[col.key]}
                          onChange={(e) =>
                            handleEdit(
                              (currentPage - 1) * rowsPerPage + rowIndex,
                              col.key,
                              e.target.value
                            )
                          }
                          className="w-full text-left border-none bg-transparent"
                        />
                      </td>
                    )
                )}
              </tr>
            ))}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex-grow" />
        <div className="flex space-x-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={`flex items-center px-3 py-1 text-gray-700 rounded-md ${currentPage === 1
              ? "opacity-50 cursor-default"
              : "hover:bg-gray-200"
              }`}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </a>
          {Array.from({ length: pageCount }, (_, index) => (
            <a
              key={index}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(index + 1);
              }}
              className={`flex items-center px-3 py-1 rounded-md ${currentPage === index + 1
                ? "bg-[#1995AD] text-white"
                : "text-gray-700 hover:bg-gray-200"
                }`}
            >
              {index + 1}
            </a>
          ))}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={`flex items-center px-3 py-1 text-gray-700 rounded-md ${currentPage === pageCount
              ? "opacity-50 cursor-default"
              : "hover:bg-gray-200"
              }`}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
