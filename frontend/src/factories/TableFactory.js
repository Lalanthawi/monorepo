/**
 * TABLE FACTORY
 * 
 * Factory pattern for creating dynamic tables with sorting, filtering, and pagination.
 * Easy to add new column types and table features during presentations.
 */

import React from 'react';
import { UI_CONFIG } from '../config/app.config.js';

export class TableFactory {
  constructor(config = UI_CONFIG) {
    this.config = config;
    this.columnRenderers = new Map();
    this.filters = new Map();
    this.initializeDefaultRenderers();
    this.initializeDefaultFilters();
  }

  // MODIFICATION POINT: Register new column types
  initializeDefaultRenderers() {
    this.registerColumnRenderer('text', this.renderTextColumn);
    this.registerColumnRenderer('number', this.renderNumberColumn);
    this.registerColumnRenderer('date', this.renderDateColumn);
    this.registerColumnRenderer('status', this.renderStatusColumn);
    this.registerColumnRenderer('actions', this.renderActionsColumn);
    this.registerColumnRenderer('avatar', this.renderAvatarColumn);
    this.registerColumnRenderer('badge', this.renderBadgeColumn);
    
    // Example: Progress bar column
    // this.registerColumnRenderer('progress', this.renderProgressColumn);
  }

  initializeDefaultFilters() {
    this.registerFilter('text', this.textFilter);
    this.registerFilter('number', this.numberFilter);
    this.registerFilter('date', this.dateFilter);
    this.registerFilter('select', this.selectFilter);
    
    // MODIFICATION POINT: Add custom filters
    // this.registerFilter('range', this.rangeFilter);
  }

  registerColumnRenderer(type, renderer) {
    this.columnRenderers.set(type, renderer);
  }

  registerFilter(type, filter) {
    this.filters.set(type, filter);
  }

  // MODIFICATION POINT: Easy table creation from configuration
  createTable(tableConfig) {
    const {
      columns,
      data = [],
      pagination = true,
      sorting = true,
      filtering = false,
      selection = false,
      className = '',
      onRowClick,
      onSelectionChange,
      emptyMessage = 'No data available'
    } = tableConfig;

    return (props) => {
      const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });
      const [filterValues, setFilterValues] = React.useState({});
      const [currentPage, setCurrentPage] = React.useState(1);
      const [pageSize, setPageSize] = React.useState(this.config.PAGINATION.DEFAULT_PAGE_SIZE);
      const [selectedRows, setSelectedRows] = React.useState(new Set());

      // Filter data
      const filteredData = React.useMemo(() => {
        if (!filtering) return data;
        
        return data.filter(row => {
          return columns.every(column => {
            const filterValue = filterValues[column.key];
            if (!filterValue) return true;
            
            const filterFn = this.filters.get(column.filterType || 'text');
            return filterFn ? filterFn(row[column.key], filterValue) : true;
          });
        });
      }, [data, filterValues, columns]);

      // Sort data
      const sortedData = React.useMemo(() => {
        if (!sorting || !sortConfig.key) return filteredData;
        
        return [...filteredData].sort((a, b) => {
          const aVal = a[sortConfig.key];
          const bVal = b[sortConfig.key];
          
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }, [filteredData, sortConfig]);

      // Paginate data
      const paginatedData = React.useMemo(() => {
        if (!pagination) return sortedData;
        
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
      }, [sortedData, currentPage, pageSize, pagination]);

      const handleSort = (columnKey) => {
        setSortConfig(prev => ({
          key: columnKey,
          direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
      };

      const handleFilter = (columnKey, value) => {
        setFilterValues(prev => ({ ...prev, [columnKey]: value }));
        setCurrentPage(1); // Reset to first page when filtering
      };

      const handleRowSelection = (rowIndex, selected) => {
        const newSelection = new Set(selectedRows);
        if (selected) {
          newSelection.add(rowIndex);
        } else {
          newSelection.delete(rowIndex);
        }
        setSelectedRows(newSelection);
        onSelectionChange?.(Array.from(newSelection));
      };

      const handleSelectAll = (selected) => {
        if (selected) {
          const allIndices = new Set(paginatedData.map((_, index) => index));
          setSelectedRows(allIndices);
          onSelectionChange?.(Array.from(allIndices));
        } else {
          setSelectedRows(new Set());
          onSelectionChange?.([]);
        }
      };

      return React.createElement('div', {
        className: `table-factory ${className}`
      }, [
        // Filters
        filtering && React.createElement('div', {
          key: 'filters',
          className: 'table-filters mb-4'
        }, columns.filter(col => col.filterable).map(column =>
          this.renderFilter(column, filterValues[column.key], 
            (value) => handleFilter(column.key, value))
        )),

        // Table
        React.createElement('div', {
          key: 'table-container',
          className: 'table-container overflow-x-auto'
        }, [
          React.createElement('table', {
            key: 'table',
            className: 'table w-full border-collapse'
          }, [
            // Header
            React.createElement('thead', { key: 'thead' }, [
              React.createElement('tr', { key: 'header-row' }, [
                // Selection header
                selection && React.createElement('th', {
                  key: 'select-all',
                  className: 'table-header p-2 border'
                }, [
                  React.createElement('input', {
                    type: 'checkbox',
                    onChange: (e) => handleSelectAll(e.target.checked),
                    checked: selectedRows.size === paginatedData.length && paginatedData.length > 0
                  })
                ]),
                
                // Column headers
                ...columns.map(column =>
                  React.createElement('th', {
                    key: column.key,
                    className: `table-header p-2 border ${sorting && column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`,
                    onClick: sorting && column.sortable ? () => handleSort(column.key) : undefined
                  }, [
                    column.title,
                    sorting && column.sortable && sortConfig.key === column.key && 
                    React.createElement('span', {
                      className: 'ml-1'
                    }, sortConfig.direction === 'asc' ? '↑' : '↓')
                  ])
                )
              ])
            ]),

            // Body
            React.createElement('tbody', { key: 'tbody' }, 
              paginatedData.length === 0 ? 
                React.createElement('tr', { key: 'empty' }, [
                  React.createElement('td', {
                    colSpan: columns.length + (selection ? 1 : 0),
                    className: 'table-cell p-4 text-center text-gray-500 border'
                  }, emptyMessage)
                ]) :
                paginatedData.map((row, rowIndex) =>
                  React.createElement('tr', {
                    key: rowIndex,
                    className: `table-row ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${selectedRows.has(rowIndex) ? 'bg-blue-50' : ''}`,
                    onClick: onRowClick ? () => onRowClick(row, rowIndex) : undefined
                  }, [
                    // Selection cell
                    selection && React.createElement('td', {
                      key: 'select',
                      className: 'table-cell p-2 border'
                    }, [
                      React.createElement('input', {
                        type: 'checkbox',
                        checked: selectedRows.has(rowIndex),
                        onChange: (e) => handleRowSelection(rowIndex, e.target.checked),
                        onClick: (e) => e.stopPropagation()
                      })
                    ]),
                    
                    // Data cells
                    ...columns.map(column => {
                      const renderer = this.columnRenderers.get(column.type || 'text');
                      return React.createElement('td', {
                        key: column.key,
                        className: 'table-cell p-2 border'
                      }, renderer ? renderer(row[column.key], row, column) : row[column.key]);
                    })
                  ])
                )
            )
          ])
        ]),

        // Pagination
        pagination && sortedData.length > 0 && this.renderPagination({
          currentPage,
          pageSize,
          totalItems: sortedData.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        })
      ]);
    };
  }

  // Column renderers
  renderTextColumn = (value) => value || '';

  renderNumberColumn = (value) => {
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  renderDateColumn = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  renderStatusColumn = (value, row, column) => {
    const statusColors = column.statusColors || {};
    const colorClass = statusColors[value] || 'bg-gray-100 text-gray-800';
    
    return React.createElement('span', {
      className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`
    }, value);
  };

  renderActionsColumn = (value, row, column) => {
    const actions = column.actions || [];
    
    return React.createElement('div', {
      className: 'flex gap-2'
    }, actions.map((action, index) =>
      React.createElement('button', {
        key: index,
        className: `btn btn-sm ${action.className || 'btn-primary'}`,
        onClick: (e) => {
          e.stopPropagation();
          action.onClick(row);
        }
      }, action.label)
    ));
  };

  renderAvatarColumn = (value, row, column) => {
    return React.createElement('div', {
      className: 'flex items-center gap-2'
    }, [
      React.createElement('img', {
        key: 'avatar',
        src: value || '/default-avatar.png',
        alt: row[column.nameField] || 'User',
        className: 'w-8 h-8 rounded-full object-cover'
      }),
      React.createElement('span', {
        key: 'name'
      }, row[column.nameField] || '')
    ]);
  };

  renderBadgeColumn = (value, row, column) => {
    const badges = Array.isArray(value) ? value : [value];
    
    return React.createElement('div', {
      className: 'flex gap-1 flex-wrap'
    }, badges.map((badge, index) =>
      React.createElement('span', {
        key: index,
        className: 'inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800'
      }, badge)
    ));
  };

  // MODIFICATION POINT: Add new column renderers
  renderProgressColumn = (value) => {
    const percentage = Math.min(100, Math.max(0, value));
    return React.createElement('div', {
      className: 'w-full bg-gray-200 rounded-full h-2'
    }, [
      React.createElement('div', {
        className: 'bg-blue-600 h-2 rounded-full',
        style: { width: `${percentage}%` }
      })
    ]);
  };

  // Filter renderers
  renderFilter(column, value, onChange) {
    const filterType = column.filterType || 'text';
    
    return React.createElement('div', {
      key: column.key,
      className: 'inline-block mr-4'
    }, [
      React.createElement('label', {
        key: 'label',
        className: 'block text-sm font-medium mb-1'
      }, `Filter ${column.title}`),
      
      filterType === 'select' ? 
        React.createElement('select', {
          key: 'input',
          value: value || '',
          onChange: (e) => onChange(e.target.value),
          className: 'form-select'
        }, [
          React.createElement('option', { key: 'all', value: '' }, 'All'),
          ...(column.filterOptions || []).map(option =>
            React.createElement('option', {
              key: option.value,
              value: option.value
            }, option.label)
          )
        ]) :
        React.createElement('input', {
          key: 'input',
          type: filterType === 'number' ? 'number' : 'text',
          placeholder: `Filter by ${column.title}`,
          value: value || '',
          onChange: (e) => onChange(e.target.value),
          className: 'form-input'
        })
    ]);
  }

  // Pagination renderer
  renderPagination({ currentPage, pageSize, totalItems, onPageChange, onPageSizeChange }) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return React.createElement('div', {
      className: 'table-pagination flex items-center justify-between mt-4'
    }, [
      React.createElement('div', {
        key: 'info',
        className: 'text-sm text-gray-700'
      }, `Showing ${startItem} to ${endItem} of ${totalItems} entries`),
      
      React.createElement('div', {
        key: 'controls',
        className: 'flex items-center gap-4'
      }, [
        React.createElement('select', {
          key: 'page-size',
          value: pageSize,
          onChange: (e) => onPageSizeChange(Number(e.target.value)),
          className: 'form-select'
        }, this.config.PAGINATION.PAGE_SIZE_OPTIONS.map(size =>
          React.createElement('option', { key: size, value: size }, `${size} per page`)
        )),
        
        React.createElement('div', {
          key: 'page-controls',
          className: 'flex gap-1'
        }, [
          React.createElement('button', {
            key: 'prev',
            disabled: currentPage === 1,
            onClick: () => onPageChange(currentPage - 1),
            className: 'btn btn-sm'
          }, 'Previous'),
          
          React.createElement('span', {
            key: 'page-info',
            className: 'px-3 py-1'
          }, `Page ${currentPage} of ${totalPages}`),
          
          React.createElement('button', {
            key: 'next',
            disabled: currentPage === totalPages,
            onClick: () => onPageChange(currentPage + 1),
            className: 'btn btn-sm'
          }, 'Next')
        ])
      ])
    ]);
  }

  // Filter functions
  textFilter = (value, filterValue) => {
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  };

  numberFilter = (value, filterValue) => {
    return Number(value) === Number(filterValue);
  };

  dateFilter = (value, filterValue) => {
    const date = new Date(value);
    const filterDate = new Date(filterValue);
    return date.toDateString() === filterDate.toDateString();
  };

  selectFilter = (value, filterValue) => {
    return value === filterValue;
  };
}

export const tableFactory = new TableFactory();

// EXAMPLE USAGE:
/*
const usersTableConfig = {
  columns: [
    { key: 'name', title: 'Name', type: 'text', sortable: true, filterable: true },
    { key: 'email', title: 'Email', type: 'text', sortable: true, filterable: true },
    { key: 'role', title: 'Role', type: 'status', filterable: true, filterType: 'select',
      filterOptions: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' }
      ]
    },
    { key: 'actions', title: 'Actions', type: 'actions',
      actions: [
        { label: 'Edit', onClick: (row) => console.log('Edit', row) },
        { label: 'Delete', onClick: (row) => console.log('Delete', row) }
      ]
    }
  ],
  data: users,
  pagination: true,
  sorting: true,
  filtering: true,
  onRowClick: (row) => console.log('Row clicked:', row)
};

const UsersTable = tableFactory.createTable(usersTableConfig);
*/