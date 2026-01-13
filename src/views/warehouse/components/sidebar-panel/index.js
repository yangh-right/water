import SidebarPanel from './sidebar-panel'

SidebarPanel.install = (Vue, options) => {
  Vue.component(SidebarPanel.name, SidebarPanel)
}

export default SidebarPanel
