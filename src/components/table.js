import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Column,
  Table as VirtualizedTable,
  WindowScroller,
} from 'react-virtualized';
import {
  defaultHeaderRenderer,
  defaultRowRenderer,
} from 'react-virtualized/dist/commonjs/Table';
import styled from 'styled-components';

const Table = forwardRef(
  ({ headings, rows, id, onRowClick, cellMeasurerCacheRef }, ref) => {
    const [cache] = React.useState(createCache());
    React.useEffect(() => {
      if (cellMeasurerCacheRef) {
        // eslint-disable-next-line no-param-reassign
        cellMeasurerCacheRef.current = cache;
      }
      const clearCache = () => cache.clearAll();
      window.addEventListener('resize', clearCache);
      return () => window.removeEventListener('resize', clearCache);
    }, [cache, cellMeasurerCacheRef]);

    // TODO: Implement focusNewItems (along with "Load more" functionality)
    // TODO: Test if scrollRef is needed for wrapping element
    return (
      <StyledTableWrapper
        className="table"
        id={id}
        $hoverEffects={!!onRowClick}
      >
        <WindowScroller>
          {({ height, scrollTop, onChildScroll, isScrolling }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <VirtualizedTable
                  ref={ref}
                  headerHeight={30}
                  tabIndex={null}
                  width={width}
                  autoHeight
                  height={height}
                  scrollTop={scrollTop}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  rowCount={rows.length}
                  rowGetter={({ index }) => rows[index]}
                  rowHeight={cache.rowHeight}
                  deferredMeasurementCache={cache}
                  rowRenderer={rowRenderer}
                  onRowClick={onRowClick}
                  rowClassName={({ index }) => {
                    if (index !== -1 && index % 2 === 0) {
                      return 'even';
                    }
                    return 'odd';
                  }}
                >
                  {headings.map((heading, columnIndex) => (
                    <Column
                      key={heading.key}
                      dataKey={heading.key}
                      label={heading.text}
                      width={heading.width}
                      headerRenderer={(props) =>
                        columnHeaderRenderer({
                          ...props,
                          style: heading.style ? heading.style : {},
                        })
                      }
                      cellRenderer={(props) =>
                        columnCellRenderer({
                          cache,
                          ...props,
                          style: heading.cellStyle ? heading.cellStyle : {},
                          columnIndex,
                          rows,
                        })
                      }
                    />
                  ))}
                </VirtualizedTable>
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      </StyledTableWrapper>
    );
  }
);

Table.displayName = 'Table'; // with forwardRef, we get eslint warning about this so add displayName manually.

Table.propTypes = {
  headings: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string,
      width: PropTypes.number,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  id: PropTypes.string.isRequired,
  onRowClick: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  cellMeasurerCacheRef: PropTypes.shape({ current: PropTypes.any }),
};

Table.defaultProps = {
  onRowClick: null,
  cellMeasurerCacheRef: null,
};

export default Table;

/* Helpers */

const createCache = () =>
  new CellMeasurerCache({ defaultHeight: 50, fixedWidth: true });

const rowRenderer = ({ style, rowData, ...props }) =>
  defaultRowRenderer({ style: { ...style }, rowData, ...props });

const columnHeaderRenderer = ({ style, ...props }) => {
  if (!props.label) {
    return defaultHeaderRenderer({ style, ...props });
  }
  return (
    <StyledHeaderCell>
      {defaultHeaderRenderer({ style, ...props })}
    </StyledHeaderCell>
  );
};

const columnCellRenderer = ({
  cellData,
  dataKey,
  parent,
  rowIndex,
  cache,
  style,
  columnIndex,
  rows,
}) => (
  <CellMeasurer
    cache={cache}
    key={dataKey}
    parent={parent}
    rowIndex={rowIndex}
    columnIndex={columnIndex}
  >
    {({ registerChild }) => {
      const row = rows[rowIndex];
      const additionalStyles = {
        height: '100%',
      };
      if (columnIndex === 0 && row.rowColor) {
        additionalStyles.borderLeft = `6px solid ${row.rowColor}`;
      }
      return (
        <StyledCell
          className={`table-cell-${dataKey}`}
          ref={registerChild}
          style={{ ...style, ...additionalStyles }}
        >
          {cellData}
        </StyledCell>
      );
    }}
  </CellMeasurer>
);

/* Styled Components */

const StyledTableWrapper = styled.div`
  .ReactVirtualized__Table__headerRow {
    text-transform: none;
  }

  .odd:not(.ReactVirtualized__Table__headerRow) {
    background-color: ${(props) => props.theme.grey200};
  }

  *[role='row']:not(.ReactVirtualized__Table__headerRow) {
    transition: background-color 100ms ease-in-out;
    &:hover {
      cursor: ${(props) => (props.$hoverEffects ? 'pointer' : 'auto')};
      ${(props) =>
        props.$hoverEffects && `background-color: ${props.theme.grey250};`}
    }
  }

  // React Virtualized likes to use overflow: hidden extensively – override them to
  // allow dropdown modals to go over other cells/rows/the whole table
  .ReactVirtualized__Grid,
  .ReactVirtualized__Grid__innerScrollContainer,
  .ReactVirtualized__Table__row,
  .ReactVirtualized__Table__rowColumn,
  .ReactVirtualized__Table__headerColumn {
    overflow: visible !important;
    margin: 0;
    height: 100%;
  }

  *[role='row'] {
    border-bottom: 0.063em solid ${(props) => props.theme.grey250};
  }

  *[role='gridcell'] {
    white-space: normal;
    flex: 1 1 0;
  }

  *[role='columnheader'] {
    white-space: normal;
    flex: 1 1 0;
  }

  svg {
    vertical-align: middle;
  }
`;

const StyledCell = styled.div`
  padding: 1em;
  overflow: visible;
  display: flex;
  align-items: center;
`;

const StyledHeaderCell = styled.div`
  padding: 0 1em;
`;
