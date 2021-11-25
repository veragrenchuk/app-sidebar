import { makeStyles } from '@mui/styles';

export default makeStyles({
  absoluteLineBlock: {
    position: 'absolute',
    top: 0,
  },
  collapseButton: {},
  highlightBottomLeftCorner: {
    zIndex: 3,
  },
  highlightLineVertical: {
    zIndex: 3,
  },
  highlightTopLeftCorner: {
    zIndex: 3,
  },
  lineBlock: {
    display: 'inline-block',
    flex: '0 0 auto',
    height: '100%',
    position: 'relative',
  },
  lineChildren: {
    display: 'inline-block',
    height: '100%',
  },
  dragIndicatorWrapper: {
    opacity: 0,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '5px',
    cursor: 'grab',
    position: 'absolute',
    right: '10px',
  },
  active: {
    backgroundColor: '#f2f8f9',
  },
  workingGroup: {
    marginLeft: '15px',
    marginRight: '15px',
  },
  nodeContent: {
    height: '71px',
    width: '100%',
    display: 'flex',
    position: 'relative',
    cursor: 'default',
    zIndex: 20,
    '& $collapseButton, & $expandButton': {
      appearance: 'none',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      height: 30,
      padding: 0,
      width: 30,
      zIndex: 2,
    },
    '& $collapseButton': {
      '&::after': {
        content: '""',
        right: '50px',
        position: 'absolute',
        borderLeft: '2px solid #2E3A59',
        borderBottom: '2px solid #2E3A59',
        display: 'block',
        width: '10px',
        height: '10px',
        transform: 'rotate(-225deg)',
        marginLeft: '7px',
        marginTop: '-5px',
      },
    },
    '& $expandButton': {
      '&::after': {
        content: '""',
        right: '50px',
        position: 'absolute',
        borderLeft: '2px solid #2E3A59',
        borderBottom: '2px solid #2E3A59',
        display: 'block',
        width: '10px',
        height: '10px',
        transform: 'rotate(-45deg)',
        marginLeft: '7px',
        marginTop: '-5px',
      },
    },
    '& $lineBlock, & $absoluteLineBlock': {
      display: 'inline-block',
      flex: '0 0 auto',
      height: '100%',
      borderRight: '1px solid #C9CECF',
      position: 'relative',
      width: '44px !important',
    },
    '& $rowContents': {
      alignItems: 'center',
      marginLeft: '-1px',
      paddingLeft: '12px',
      color: '#404040',
      fontSize: '14px',
      display: 'flex',
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    '& $rowLabel': {
      flex: 1,
      padding: '0px 6px',
      maxWidth: '220px',
    },
    '&:hover': {
      '& $borderStar': {
        opacity: 1,
      },
    },
  },
  transparentBorder: {
    borderLeft: '3px solid transparent',
  },
  subNodeContent: {
    height: 'auto',
    minHeight: '45px',
    zIndex: 9,
    '& $rowLabel': {
      flex: 1,
      padding: '0px 19px',
    },
    '& $nodeContent': {
      color: '#C9CECF',
    },
    '&:hover': {
      '& $dragIndicatorWrapper': {
        opacity: 1,
      },
      '& $borderStar': {
        opacity: 1,
      },
    },
  },
  row: {
    padding: '10px 0',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f8f9',
      opacity: 0.7,
      borderColor: '#288798',
    },
    '& $rowIcon, & $rowLabel,& $rowToolbar': {
      alignItems: 'center',
      display: 'flex',
    },
    '&$rowCancelPad': {
      '&::before': {
        backgroundColor: '#ffd2d6',
        border: '2px dotted #e6a8ad',
      },
    },
    '&$rowLandingPad': {
      '&::before': {
        backgroundColor: '#dddddd',
        border: '2px dotted #b5b5b5',
      },
    },
    '&$rowLandingPad, &$rowCancelPad': {
      '& *': {
        opacity: '.6 !important',
      },
      '&::before': {
        bottom: 0,
        content: '""',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: -1,
      },
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  rowCancelPad: {},
  rowContents: {},
  rowIcon: {
    color: '#D9D9D9',
  },
  rowLabel: {},
  rowLandingPad: {},
  rowSearchFocus: {
    outline: 'solid 1px #fc6421',
  },
  rowSearchMatch: {
    outline: 'solid 1px #0080ff',
  },
  rowWrapper: {
    boxSizing: 'border-box',
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  rowWrapperDragDisabled: {
    cursor: 'default',
  },
  borderStar: {
    opacity: 0,
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  rowContentsDragDisabled: {},
  rowTitle: {},
  current: {
    borderColor: '#288798',
  },
});
