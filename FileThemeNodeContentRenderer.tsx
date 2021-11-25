/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-nested-ternary */
import React from 'react';
import { useLocation } from 'react-router';
import { NodeRenderer } from 'react-sortable-tree';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ExpandLess, ExpandMore, StarBorderRounded, StarRateRounded } from '@mui/icons-material';

import useStyles from './node-content-renderer-style';

function isDescendant(older: any, younger: any) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some((child: any) => child === younger || isDescendant(child, younger))
  );
}

const FileThemeNodeContentRenderer: NodeRenderer = (props: any) => {
  const {
    onClick,
    scaffoldBlockPxWidth,
    toggleChildrenVisibility,
    connectDragPreview,
    connectDragSource,
    isDragging,
    canDrop,
    canDrag,
    node,
    title,
    draggedNode,
    path,
    treeIndex,
    isSearchMatch,
    isSearchFocus,
    className,
    style,
    didDrop,
    lowerSiblingCounts,
    listIndex,
    swapFrom,
    swapLength,
    swapDepth,
    parentNode,
    // treeId // Not needed, but preserved for other renderers
    // isOver, // Not needed, but preserved for other renderers
    // rowDirection
  } = props;
  const classes = useStyles();
  const location = useLocation();

  const nodeTitle = title || node.name;

  const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
  const isLandingPadActive = !didDrop && isDragging;

  const onNodeClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick(e, node);

    toggleChildrenVisibility({
      node,
      path,
      treeIndex,
    });
  };

  // Construct the scaffold representing the structure of the tree
  const scaffold: JSX.Element[] = [];

  const hasParent = !!parentNode;

  lowerSiblingCounts.forEach((lowerSiblingCount: number, i: number) => {
    if (i > 0) {
      scaffold.push(<div className={classes.lineBlock} key={`pre_${1 + i}`} style={{ width: scaffoldBlockPxWidth }} />);

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = '';

        if (listIndex === swapFrom + swapLength - 1)
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = classes.highlightBottomLeftCorner;
        else if (treeIndex === swapFrom)
          // This block is on the top (source) line
          highlightLineClass = classes.highlightTopLeftCorner;
        // This block is between the bottom and top
        else highlightLineClass = classes.highlightLineVertical;

        scaffold.push(
          <div
            className={`${classes.absoluteLineBlock} ${highlightLineClass}`}
            key={`highlight_${1 + i}`}
            style={{
              left: scaffoldBlockPxWidth * i,
              width: scaffoldBlockPxWidth,
            }}
          />,
        );
      }
    }
  });

  const renderExpandArrow = () =>
    node.expanded ? (
      <ExpandLess
        style={{ marginRight: '24px' }}
        fontSize={hasParent ? 'small' : 'medium'}
        sx={{
          pointerEvents: 'none',
          '&:hover': {
            color: '#288798',
          },
        }}
      />
    ) : (
      <ExpandMore
        style={{ marginRight: '24px' }}
        fontSize={hasParent ? 'small' : 'medium'}
        sx={{
          pointerEvents: 'none',
          '&:hover': {
            color: '#288798',
          },
        }}
      />
    );

  const locationItemId = location.pathname.split('/')[2];

  return (
    <div className={classes.nodeContent + (hasParent ? ` ${classes.subNodeContent}` : '')} style={{ display: 'flex' }}>
      <div className={classes.rowWrapper + (!canDrag ? ` ${classes.rowWrapperDragDisabled}` : '')}>
        {scaffold}

        {connectDragPreview(
          connectDragSource(
            <div style={{ width: '100%' }}>
              <div
                onClick={onNodeClick}
                className={
                  classes.row +
                  (isLandingPadActive ? ` ${classes.rowLandingPad}` : '') +
                  (isLandingPadActive && !canDrop ? ` ${classes.rowCancelPad}` : '') +
                  (isSearchMatch && !isSearchFocus ? ` ${classes.rowSearchMatch}` : '') +
                  (isSearchFocus ? ` ${classes.rowSearchFocus}` : '') +
                  (node.expanded && parentNode === null ? ` ${classes.active}` : ``) +
                  (node.expanded && parentNode !== null ? ` ${classes.current}` : ``) +
                  (node.expanded && parentNode !== null && node.id === locationItemId
                    ? ` ${classes.active} ${classes.current}`
                    : ``) +
                  (hasParent ? ` ${classes.transparentBorder}` : '') +
                  (className ? ` ${className}` : '')
                }
                style={{
                  opacity: isDraggedDescendant ? 0.5 : 1,
                  ...style,
                }}
              >
                <div className={classes.rowContents + (!canDrag ? ` ${classes.rowContentsDragDisabled}` : '')}>
                  {typeof node.favorite !== 'undefined' ? (
                    <span className={classes.workingGroup}>
                      {node.favorite ? (
                        <StarRateRounded fontSize="small" className={classes.borderStar} />
                      ) : (
                        <StarBorderRounded className={classes.borderStar} fontSize="small" sx={{}} />
                      )}
                    </span>
                  ) : null}
                  <div className={classes.rowLabel}>
                    {typeof nodeTitle === 'string' ? (
                      <span className={classes.rowTitle}>{nodeTitle}</span>
                    ) : typeof nodeTitle === 'function' ? (
                      nodeTitle({
                        node,
                        path,
                        treeIndex,
                      })
                    ) : (
                      nodeTitle
                    )}
                  </div>
                </div>
                {toggleChildrenVisibility && node.children && node.children.length > 0 && renderExpandArrow()}
                {!node.children || !node.children?.length
                  ? connectDragSource(
                      <div className={classes.dragIndicatorWrapper}>
                        <DragIndicatorIcon sx={{ color: '#1D1D1B' }} />
                      </div>,
                    )
                  : null}
              </div>
            </div>,
          ),
        )}
      </div>
    </div>
  );
};

FileThemeNodeContentRenderer.defaultProps = {
  buttons: undefined,
  canDrag: false,
  canDrop: false,
  className: '',
  draggedNode: undefined,
  icons: undefined,
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: undefined,
  style: {},
  swapDepth: undefined,
  swapFrom: undefined,
  swapLength: undefined,
  title: undefined,
  toggleChildrenVisibility: undefined,
};

export default FileThemeNodeContentRenderer;
