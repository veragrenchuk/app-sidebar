import { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router';
import { List, ListItem, Slide, Drawer, Toolbar, styled, IconButton, Box, Collapse } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';
import { useTheme } from '@mui/material/styles';
import { Close, ExpandLess, ExpandMore, ArrowBack } from '@mui/icons-material';
import { Button } from '@mui/material';

import { Logo } from 'features/core/components/Logo';
import { useGetMenuItemsQuery } from 'features/spaces/store/menuService';
import {
  sidebarGetters,
  sidebarActions,
  MenuItem,
  getSidebarMenuItemIconComponents,
  SidebarDataMeth,
  SidebarCheck,
} from 'features/core/store/sidebar';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useConvertData } from 'hooks/sidebar/useConvertData';
import { useExpandTree } from 'hooks/sidebar/useExpandTree';
import { PageModal } from 'features/page/PageModal';

const MuiDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    background: theme.palette.background.paper,
    width: 314,
    borderRight: 'none',
  },
}));

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const theme = useTheme();
  const outsideRef = useRef<HTMLDivElement>(null);

  const sidebarMenuItems: MenuItem[] = useAppSelector(sidebarGetters.getMenuItems);
  const isSubMenuOpen: boolean = useAppSelector(sidebarGetters.getIsSubMenuOpen);
  const currentMenuItem: MenuItem | null = useAppSelector(sidebarGetters.getCurrentMenuItem);

  const history = useHistory();
  const dispatch = useAppDispatch();

  const [isOpenPageModal, setIsOpenPageModal] = useState<boolean>(false);
  const [isUnitedMenuItems, setIsUnitedMenuItems] = useState<boolean>(false);

  const { data, isFetching } = useGetMenuItemsQuery();
  useConvertData(data, sidebarMenuItems, setIsUnitedMenuItems);

  useExpandTree({
    sidebarMenuItems,
    isOpenMenu: isOpen,
    openSubmenu: true,
    isUnitedMenuItems,
    effectOnOpen: true,
  });

  useEffect(() => {
    dispatch(sidebarActions.setIsFetch(isFetching));
  }, [isFetching, dispatch]);

  const updateItemExpanded = ({ expanded, path }: Partial<MenuItem>) => {
    dispatch(
      sidebarActions.updateMenuItemByKeyValue({
        item: { expanded: !expanded },
        key: 'path',
        value: path,
      }),
    );
  };
  const close = () => {
    onClose();
  };
  const closePageModal = () => {
    setIsOpenPageModal(false);
  };
  const clickItem = (item: MenuItem) => {
    updateItemExpanded(item);

    if (SidebarCheck.hasChildren(item.children)) {
      dispatch(sidebarActions.collapseParentChildrenByKeyValue({ key: 'path', value: item.path }));
    } else {
      close();
    }

    history.push(item.path);
  };

  // Render icon
  const renderIconComponent = (IconComponent: any, className: string) => {
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return null;
  };
  const renderExpandIcon = (expanded: boolean, fontSize?: number | undefined) => {
    const styles = {
      fontSize: fontSize || 18,
    };
    return expanded ? <ExpandLess sx={styles} /> : <ExpandMore sx={styles} />;
  };

  // Styles
  const getListItemStyles = (expanded: boolean, isHover: boolean = true) => {
    const { light, dark } = theme.palette.secondary;
    const styles = {
      minHeight: 67,
      paddingRight: '19px',
      flexDirection: 'row',
      color: expanded ? light : dark,
      opacity: expanded ? 1 : 0.5,
      backgroundColor: expanded ? alpha(light, 0.04) : '',
      justifyContent: 'space-between',
      zIndex: 16,
      '.listItemInactiveIcon, .listItemActiveIcon, .listItemHoverIcon': {
        height: '37px',
        width: '37px',
        marginRight: '5px',
      },
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
        '.listItemInactiveIcon': {
          display: 'none',
        },
        '.listItemHoverIcon': {
          display: expanded ? 'none' : 'block',
        },
      },
    };

    if (!expanded && isHover) {
      // @ts-ignore
      styles['&:hover'] = {
        opacity: 1,
        color: () => alpha(dark, 0.5),
        cursor: 'pointer',
      };
    }

    return styles;
  };
  const getSubListItemStyles = (expanded: boolean, isHover: boolean = true) => {
    const { dark, light } = theme.palette.secondary;
    return {
      ...getListItemStyles(expanded, isHover),
      paddingLeft: '34px',
      paddingRight: '16px',
      fontSize: '15px',
      color: dark,
      backgroundColor: expanded ? alpha(light, 0.04) : '',
    };
  };
  const getSubListChildItemStyles = (expanded: boolean, isHover: boolean = true) => {
    const { light, dark } = theme.palette.secondary;

    return {
      borderLeft: `3px solid ${expanded ? light : theme.palette.background.paper}`,
      justifyContent: 'space-between',
      minHeight: '45px',
      fontSize: '13px',
      paddingRight: '18px',
      color: expanded ? light : dark,
      fontWeight: expanded ? 600 : 300,
      opacity: expanded ? 1 : 0.5,
      '&:hover': {
        backgroundColor: isHover ? alpha(light, 0.04) : '',
      },
    };
  };

  // Handle click
  const handleClickBackToMenuItems = (item: MenuItem) => {
    dispatch(sidebarActions.setIsSubMenuOpen(false));
    dispatch(sidebarActions.collapseParentChildrenByKeyValue({ key: 'path', value: item.path }));
    history.push(item.path);
  };
  const handleClick = (item: MenuItem, isChild: boolean = false) => {
    if (!isChild) {
      dispatch(sidebarActions.collapseAllExpandedItems());
      dispatch(sidebarActions.setCurrentMenuItem(item));
    } else {
      const parent = SidebarDataMeth.findMenuItemByKeyValue(sidebarMenuItems, 'path', item.parent!, true);
      if (parent) {
        dispatch(sidebarActions.setCurrentMenuItem(parent));
      }
    }

    clickItem(item);
  };
  const handleClickChild = (item: MenuItem) => {
    handleClick(item, true);
    if (SidebarCheck.hasChildren(item.children)) {
      dispatch(sidebarActions.setIsSubMenuOpen(true));
    }
  };
  const handleClickSubMenuItem = (item: MenuItem) => {
    dispatch(sidebarActions.collapseAllNeighborsItems({ item }));
    clickItem(item);
  };
  const handleClickOpenPageModal = () => {
    setIsOpenPageModal(true);
  };

  // Render menu
  const renderMenuItemChildren = (items: MenuItem[], expanded: boolean) => (
    <List sx={{ padding: 0, maxHeight: '600px', overflow: 'scroll' }}>
      {items.map((item: MenuItem) => {
        const { name, path, children, expanded: itemExpanded } = item;
        const has = SidebarCheck.hasChildren(children);
        const { dark: darkColor } = theme.palette.secondary;
        return (
          <Collapse
            sx={{
              borderLeft: `1px solid ${alpha(darkColor, 0.5)}`,
              marginLeft: '66px',
            }}
            key={path}
            in={expanded}
            timeout="auto"
            unmountOnExit
          >
            <Box
              sx={{
                minHeight: '67px',
                fontSize: 15,
                color: darkColor,
                letterSpacing: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <ListItem sx={{ paddingRight: '19px' }} onClick={() => handleClickChild(item)}>
                <Box
                  sx={{
                    color: darkColor,
                    maxWidth: '195px',
                    marginRight: 'auto',
                  }}
                >
                  {name}
                </Box>
                {has && renderExpandIcon(itemExpanded!)}
              </ListItem>
            </Box>
          </Collapse>
        );
      })}
      <Collapse
        sx={{
          borderLeft: `1px solid ${alpha(theme.palette.secondary.dark, 0.5)}`,
          marginLeft: '66px',
        }}
        key="menu_items_add_new_page"
        in={expanded}
        timeout="auto"
        unmountOnExit
      >
        <ListItem>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            sx={{
              lineHeight: '.5',
              fontWeight: 300,
              color: theme.palette.secondary.dark,
            }}
            onClick={handleClickOpenPageModal}
          >
            <em>+ Add new Page</em>
          </Button>
        </ListItem>
      </Collapse>
    </List>
  );
  const renderMenuItems = (items: MenuItem[]) => (
    <Slide direction="right" in={isOpen && !isSubMenuOpen}>
      <List sx={{ paddingTop: 0 }}>
        {items.map((item: MenuItem) => {
          const { name, iconComponentName, path, expanded, children } = item;
          const has = SidebarCheck.hasChildren(children);
          const iconComponents = getSidebarMenuItemIconComponents(iconComponentName!);
          return (
            <div key={path}>
              <ListItem onClick={() => handleClick(item)} sx={getListItemStyles(expanded!)}>
                <Box
                  style={{
                    fontSize: 16,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {renderIconComponent(iconComponents[0], 'listItemInactiveIcon')}
                    {renderIconComponent(iconComponents[1], 'listItemActiveIcon')}
                    {renderIconComponent(iconComponents[2], 'listItemHoverIcon')}
                    {name}
                  </div>
                  {has && renderExpandIcon(expanded!)}
                </Box>
              </ListItem>
              {has && renderMenuItemChildren(children as MenuItem[], expanded!)}
            </div>
          );
        })}
      </List>
    </Slide>
  );

  // Render submenu
  const renderSubMenuItemChildren = (items: MenuItem[], expanded: boolean) => {
    const hasExpanded = SidebarCheck.hasListExpandedItem(items);
    const { dark } = theme.palette.secondary;
    return (
      <List sx={{ padding: 0 }}>
        {items.map(item => {
          const { name, path, children, expanded: itemExpanded } = item;
          const has = SidebarCheck.hasChildren(children);
          return (
            <Collapse
              sx={{
                borderLeft: `1px solid ${alpha(dark, 0.5)}`,
                marginLeft: '18%',
              }}
              key={path}
              in={expanded}
              timeout="auto"
              unmountOnExit
            >
              <ListItem
                onClick={() => handleClickSubMenuItem(item)}
                sx={{ ...getSubListChildItemStyles(itemExpanded!), opacity: !hasExpanded || itemExpanded ? 1 : 0.5 }}
              >
                <Box>{name}</Box>
                {has && renderExpandIcon(itemExpanded!)}
              </ListItem>
              {has && renderSubMenuItemChildren(children as MenuItem[], itemExpanded!)}
            </Collapse>
          );
        })}
        <Collapse
          sx={{
            borderLeft: `1px solid ${alpha(dark, 0.5)}`,
            marginLeft: '18%',
          }}
          key="sub_menu_item_child_add_new_page"
          in={expanded}
          timeout="auto"
          unmountOnExit
        >
          <ListItem sx={{ ...getSubListChildItemStyles(false, false), opacity: hasExpanded ? 0.5 : 1 }}>
            <Button
              variant="contained"
              size="small"
              color="inherit"
              sx={{
                lineHeight: '.5',
                fontWeight: 300,
                color: dark,
              }}
              onClick={handleClickOpenPageModal}
            >
              <em>+ Add new Page</em>
            </Button>
          </ListItem>
        </Collapse>
      </List>
    );
  };
  const renderSubMenuItems = (current: MenuItem) => {
    const obj = SidebarDataMeth.findMenuItemByKeyValue(sidebarMenuItems, 'path', current.path);
    const items: MenuItem[] = obj ? (obj.children as MenuItem[]) : [];
    return (
      <List sx={{ padding: 0 }}>
        {items.map((item: MenuItem) => {
          const { name, path, expanded, children } = item;
          const has = SidebarCheck.hasChildren(children);
          return (
            <div key={path}>
              <ListItem onClick={() => handleClickSubMenuItem(item)} sx={getSubListItemStyles(expanded!)}>
                <Box
                  style={{
                    fontSize: '15px',
                    maxWidth: '195px',
                  }}
                >
                  {name}
                </Box>
                {has && renderExpandIcon(expanded!, 22)}
              </ListItem>
              {has && renderSubMenuItemChildren(children as MenuItem[], expanded!)}
            </div>
          );
        })}
        <div key="sub_menu_item_add_new_page">
          <ListItem
            sx={{
              ...getSubListItemStyles(false, false),
              minHeight: '42px',
            }}
          >
            <Button
              variant="contained"
              size="small"
              color="inherit"
              sx={{
                lineHeight: '.5',
                fontWeight: 300,
                color: theme.palette.secondary.dark,
              }}
              onClick={handleClickOpenPageModal}
            >
              <em>+ Add new Page</em>
            </Button>
          </ListItem>
        </div>
      </List>
    );
  };
  const renderSubMenuContainer = () => {
    const has = SidebarCheck.hasChildren(currentMenuItem?.children);
    const { contrastText, dark } = theme.palette.secondary;
    return (
      <Slide direction="right" in={isOpen && isSubMenuOpen}>
        <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 15,
              opacity: 0.5,
              lineHeight: '23px',
              margin: '23px 0 15px 19px',
              borderBottom: `1px solid ${alpha(contrastText, 0.2)}`,
              paddingBottom: '5px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: dark,
            }}
          >
            <ArrowBack
              sx={{
                width: '24px',
                height: '24px',
                marginRight: '7px',
              }}
              onClick={() => handleClickBackToMenuItems(currentMenuItem!)}
            />
            {currentMenuItem?.title}
          </Box>
          {has && renderSubMenuItems(currentMenuItem as MenuItem)}
        </div>
      </Slide>
    );
  };

  return (
    <MuiDrawer open={isOpen}>
      <div ref={outsideRef}>
        <Toolbar
          style={{
            height: 71,
            borderBottom: '1px solid rgba(151, 151, 151, .2)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Logo opacity={1} />
          <IconButton sx={{ padding: 0 }} onClick={close}>
            <Close />
          </IconButton>
        </Toolbar>
        {!isSubMenuOpen && renderMenuItems(sidebarMenuItems)}
        {renderSubMenuContainer()}
        <PageModal open={isOpenPageModal} onClose={closePageModal} />
      </div>
    </MuiDrawer>
  );
};
