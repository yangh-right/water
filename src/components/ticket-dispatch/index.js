import genSchema from '@wpg/form-design/es/utils/genSchema'
import TicketDispatch from './src/index.vue'

TicketDispatch.install = (app) => {
  app.component(TicketDispatch.name, TicketDispatch)
}

TicketDispatch.schemaConfig = {
  groupType: 'produce',
  icon: 'assign',
  componentPack: {
    viewSchema: {
      title: '指派',
      type: 'array',
      'ui:widget': 'TicketDispatch',
    },
    propsSchema: genSchema({}, 'array', {
      isMultiSelect: true,
      keepValue: false,
    }),
  },
  property: 'ticketDispatchUserIds',
}

export default TicketDispatch
