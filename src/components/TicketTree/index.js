import FittingTree from './FittingTree';
import DeviceMaintain from './DeviceMaintain';
import MaintainPump from './MaintainPump.vue';
import InspectPump from './InspectPump.vue';
import WashTank from './WashTank';
import TicketSignin from './TicketSignin';
import Tree from './Tree';
import DeviceTable from './DeviceTable';
import ComponentTable from './ComponentTable';
import PumpTable from './PumpTable';
import UserSelect from './UserSelect';

Tree.install = function(app) {
  app.component(Tree.name, Tree);
  app.component(DeviceMaintain.name, DeviceMaintain);
  app.component(MaintainPump.name, MaintainPump);
  app.component(InspectPump.name, InspectPump);
  app.component(WashTank.name, WashTank);
  app.component(TicketSignin.name, TicketSignin);
  app.component(FittingTree.name, FittingTree);
  app.component(DeviceTable.name, DeviceTable);
  app.component(ComponentTable.name, ComponentTable);
  app.component(PumpTable.name, PumpTable);
  app.component(UserSelect.name, UserSelect);
};

export default Tree;
