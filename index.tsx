import React, { useRef, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useTheme } from '@mui/material';
import { List, ListItem, Drawer, Toolbar, Box, Slide, styled, Button } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import SortableTree, { TreeItem } from 'react-sortable-tree';
import { useSnackbar } from 'notistack';
import MaterialTheme from 'react-sortable-tree-theme-material-ui';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useExpandTree } from 'hooks/sidebar/useExpandTree';
import {
  getSidebarMenuItemIconComponents,
  MenuItem,
  sidebarGetters,
  sidebarActions,
  StaticMenuItemName,
  SidebarDataMeth,
  SidebarCheck,
} from 'features/core/store/sidebar';
import { useCreatePageMutation } from 'features/page/store/pageService';
import { useCreateBlockMutation } from 'features/page/store/blockService';
import { WidgetTextDefinition } from 'features/dashboard/components/Widgets/WidgetText';
import { ReloadingPageButton } from 'features/core/components/Button/ReloadingPageButton';
import FileThemeNodeContentRenderer from 'features/core/components/AppSidebar/FileThemeNodeContentRenderer';
import { useConvertData } from 'hooks/sidebar/useConvertData';
import { useSortableTreeScrolling } from 'hooks/sidebar/useSortableTreeScrolling';
import { useGetMenuItemsQuery, useUpdateMenuItemsMutation, Menu } from 'features/spaces/store/menuService';
import useOutsideClick from 'features/core/dataTable/hooks/useOutsideClick';

const StyledDrower = styled(Drawer)(({ theme }) => ({
  flexShrink: 0,
  p: 3,
  zIndex: 15,
  width: 80,
  [`& .MuiDrawer-paper`]: {
    boxSizing: 'border-box',
    background: theme.palette.background.paper,
    width: 80,
    borderRight: 'none',
  },
}));
const StyledChevronLeft = styled(ChevronLeft)(({ theme }) => ({
  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.27)',
  width: '22px',
  height: '22px',
  color: theme.palette.background.paper,
  opacity: 0.9,
  background: theme.palette.secondary.light,
  borderRadius: 50,
  position: 'absolute',
  left: '309px',
  top: '30px',
  '&:hover': {
    opacity: 1,
    cursor: 'pointer',
  },
}));
const StyledChevronRight = styled(ChevronRight)(({ theme }) => ({
  width: '15px',
  height: '15px',
  color: theme.palette.background.paper,
  opacity: 0.9,
  zIndex: 99,
  background: theme.palette.secondary.light,
  borderRadius: 50,
  position: 'fixed',
  overflow: 'none',
  left: '73px',
  top: '90px',
  '&:hover': {
    opacity: 1,
    cursor: 'pointer',
  },
}));
const StyledBox = styled(Box)(({ theme }) => ({
  fontSize: 12,
  opacity: 0.4,
  lineHeight: '23px',
  margin: '25px 15px',
  textDecoration: 'underLine',
  textUnderlinePosition: 'under',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: theme.palette.secondary.dark,
  position: 'relative',
}));
const StyledSlide = styled(Slide)(({ theme }) => ({
  marginLeft: '80px',
  marginTop: '64px',
  borderLeft: `1px solid ${theme.palette.primary.light}`,
  position: 'fixed',
  minHeight: '100%',
  width: '320px',
  backgroundColor: theme.palette.background.paper,
  zIndex: 10,
  paddingTop: 0,
  boxShadow: 'rgba(0,0,0,0.47) 0px 0px 20px -1px',
  '.sortableTree': {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 187px)',
  },
}));

export const AppSidebar: React.FC<{}> = () => {
  const outsideRef = useRef(null);

  const scrollingRef = useSortableTreeScrolling();

  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const [createPage] = useCreatePageMutation();
  const [createBlock] = useCreateBlockMutation();
  const snackbar = useSnackbar();

  const sidebarMenuItems: MenuItem[] = useAppSelector(sidebarGetters.getMenuItems);
  const currentMenuItem: MenuItem | null = useAppSelector(sidebarGetters.getCurrentMenuItem);
  const isSubMenuOpen: boolean = useAppSelector(sidebarGetters.getIsSubMenuOpen);

  const [isUnitedMenuItems, setIsUnitedMenuItems] = useState<boolean>(false);

  const [updateMenuItems] = useUpdateMenuItemsMutation();
  const { data, isFetching } = useGetMenuItemsQuery();
  useConvertData(data, sidebarMenuItems, setIsUnitedMenuItems, 'path');

  useEffect(() => {
    dispatch(sidebarActions.setIsFetch(isFetching));
  }, [isFetching, dispatch]);

  useOutsideClick(outsideRef, () => dispatch(sidebarActions.setIsSubMenuOpen(false)), isSubMenuOpen);

  useExpandTree({
    sidebarMenuItems,
    isOpenMenu: isSubMenuOpen,
    openSubmenu: false,
    isUnitedMenuItems,
  });

  const updateItemExpanded = ({ expanded, path }: Partial<MenuItem>) => {
    dispatch(
      sidebarActions.updateMenuItemByKeyValue({
        item: { expanded: !expanded },
        key: 'path',
        value: path,
      }),
    );
  };

  // Styles
  const getListItemStyles = (expanded: boolean) => {
    const { light } = theme.palette.secondary;
    return {
      flexDirection: 'column',
      color: expanded ? light : '',
      background: expanded ? theme.palette.background.default : '',
      zIndex: 15,
      '.listItemInactiveIcon': {
        display: expanded ? 'none' : 'block',
      },
      '.listItemActiveIcon': {
        display: expanded ? 'block' : 'none',
      },
      '.listItemHoverIcon': {
        display: 'none',
      },
      '&:hover': {
        backgroundColor: theme.palette.background.default,
        '.listItemInactiveIcon': {
          display: 'none',
        },
        '.listItemHoverIcon': {
          display: expanded ? 'none' : 'block',
        },
      },
      cursor: 'pointer',
    };
  };

  // Handlers
  const handleCreatePage = async () => {
    try {
      const page = await createPage({ name: 'New page', parent: currentMenuItem?.path.split('/')[2] }).unwrap();
      await createBlock({
        parent: page.id,
        type: 'text',
        schemaVersion: 0,
        properties: {
          title: WidgetTextDefinition.title,
          grid: WidgetTextDefinition.grid,
          content: WidgetTextDefinition.content,
        },
      }).unwrap();
      dispatch(sidebarActions.insertSubMenuItem(page));
      dispatch(sidebarActions.setIsSubMenuOpen(!isSubMenuOpen));
      history.push(`/edit/page/${page.id}`);
      snackbar.enqueueSnackbar('Page successfully created', { variant: 'success' });
    } catch (e) {
      snackbar.enqueueSnackbar('Something went wrong', { variant: 'error', action: ReloadingPageButton });
    }
  };
  const handleCloseSubMenu = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    dispatch(sidebarActions.setIsSubMenuOpen(!isSubMenuOpen));
  };
  const handleClickMenuItem = (item: MenuItem) => {
    const has = SidebarCheck.hasChildren(item.children);
    dispatch(sidebarActions.setIsSubMenuOpen(has));
    setTimeout(() => dispatch(sidebarActions.setCurrentMenuItem(!has ? null : item)));
    if ((currentMenuItem && currentMenuItem.path !== item.path) || !currentMenuItem) {
      dispatch(sidebarActions.collapseAllExpandedItems());
      updateItemExpanded(item);
      history.push(item.path);
    } else if (currentMenuItem && currentMenuItem.path === item.path && isSubMenuOpen) {
      dispatch(sidebarActions.collapseParentChildrenByKeyValue({ key: 'path', value: item.path }));
      dispatch(sidebarActions.setIsSubMenuOpen(false));
      history.push(item.path);
    }
  };
  const handleClickSubMenuItem = (node: TreeItem) => {
    const item = node as MenuItem;
    setTimeout(() => {
      const obj = SidebarDataMeth.findMenuItemByKeyValue(sidebarMenuItems, 'id', location.pathname.split('/')[2])!;
      if (!SidebarCheck.hasChildren(obj.children)) {
        updateItemExpanded(obj);
      }
    });

    if (!SidebarCheck.hasChildren(item.children)) {
      dispatch(sidebarActions.setIsSubMenuOpen(false));
    }

    history.push(`/page/${item.id}`);
  };
  const handleChangeTree = (treeData: TreeItem[]) => {
    if (currentMenuItem) {
      dispatch(
        sidebarActions.updateMenuItemByKeyValue({
          item: { ...currentMenuItem, expanded: true, children: treeData as MenuItem[] },
          key: 'path',
          value: currentMenuItem.path,
        }),
      );
    }
  };
  const handleMoveNode = (args: {
    treeData: object[];
    node: object;
    nextParentNode: object;
    prevPath: number[] | string[];
    prevTreeIndex: number;
    nextPath: number[] | string[];
    nextTreeIndex: number;
  }) => {
    const nextParentNode = args.nextParentNode as MenuItem;
    const treeData = args.treeData as MenuItem[];

    if (nextParentNode) {
      const newItem: MenuItem = {
        ...nextParentNode,
        children: nextParentNode.children!.map((el, idx) => ({ ...el, weight: idx + 1, parent: nextParentNode.id })),
      };
      const arr: Menu[] = [];
      SidebarDataMeth.deepForEach(newItem.children as MenuItem[], item => {
        arr.push({ ...(item as Menu), children: undefined, expanded: undefined } as Menu);
        return false;
      });
      updateMenuItems([{ ...newItem, children: undefined, expanded: undefined } as Menu, ...arr]).then();
    } else {
      const arr = treeData.map((el, idx) => ({
        ...el,
        children: undefined,
        weight: idx + 1,
        parent: currentMenuItem!.id,
        expanded: undefined,
      }));
      updateMenuItems(arr as Menu[]).then();
    }
  };

  // Render
  const renderIconComponent = (IconComponent: any, className: string) => {
    if (IconComponent) {
      return <IconComponent className={className} sx={{ fontSize: '36px', stroke: 'white' }} />;
    }
    return null;
  };
  const renderSubMenu = (current: MenuItem | null) => {
    if (current === null) {
      return <></>;
    }

    const obj = SidebarDataMeth.findMenuItemByKeyValue(sidebarMenuItems, 'path', current.path);
    // @ts-ignore
    const items: TreeItem[] = SidebarCheck.hasChildren(obj?.children) ? (obj.children as TreeItem[]) : [];
    return (
      <List>
        <StyledChevronLeft onClick={handleCloseSubMenu} />
        <StyledBox>{current.title}</StyledBox>
        <SortableTree
          generateNodeProps={() => ({
            onClick: (e: React.MouseEvent<HTMLElement>, node: MenuItem) => handleClickSubMenuItem(node),
          })}
          className="sortableTree"
          isVirtualized={false}
          treeData={items}
          onChange={treeData => handleChangeTree(treeData)}
          theme={MaterialTheme}
          maxDepth={SidebarCheck.isGeneralPage(current.name as StaticMenuItemName) ? 4 : 1}
          nodeContentRenderer={FileThemeNodeContentRenderer}
          onMoveNode={handleMoveNode}
        />
        <Box sx={{ padding: '12px' }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            sx={{
              lineHeight: '.5',
              fontWeight: 300,
              color: theme.palette.secondary.dark,
              '&:hover': {
                color: theme.palette.background.paper,
                backgroundColor: theme.palette.secondary.light,
              },
            }}
            onClick={handleCreatePage}
          >
            <em>+ Add new Page</em>
          </Button>
        </Box>
      </List>
    );
  };
  const renderMenu = () =>
    sidebarMenuItems.map((item: MenuItem) => {
      const { name, iconComponentName, expanded, path } = item;
      const iconComponents = getSidebarMenuItemIconComponents(iconComponentName!);
      return (
        <ListItem onClick={() => handleClickMenuItem(item)} key={name + path} sx={getListItemStyles(expanded!)}>
          {renderIconComponent(iconComponents[0], 'listItemInactiveIcon')}
          {renderIconComponent(iconComponents[1], 'listItemActiveIcon')}
          {renderIconComponent(iconComponents[2], 'listItemHoverIcon')}
          <Box
            sx={{
              fontSize: 11,
              textAlign: 'center',
            }}
          >
            {name}
          </Box>
        </ListItem>
      );
    });

  return (
    <>
      {currentMenuItem && !isSubMenuOpen && <StyledChevronRight onClick={handleCloseSubMenu} />}
      <div ref={outsideRef} style={{ zIndex: 10 }}>
        <StyledDrower variant="permanent">
          <Toolbar />
          <List sx={{ padding: 0 }}>{renderMenu()}</List>
        </StyledDrower>
        <StyledSlide ref={scrollingRef} direction="right" in={isSubMenuOpen}>
          {renderSubMenu(currentMenuItem)}
        </StyledSlide>
      </div>
    </>
  );
};
