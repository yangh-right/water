export const POINTS_CONFIG = {
  SOUTH: 'south',
  NORTH: 'north',
  MCP: 'mcp',
  CONTROL_N: 'control-n',
  CONTROL_S: 'control-s',
  PRESSURE: 'pressure',
  RUN_STATE: 'run_state',
  GFJ_STATE: 'gfj_state',
  DO_STATE_N: 'do_state_n',
  DP_STATE_S: 'dp_state_s'
};

export const POINTS_LIST = [
  {
    name: '南池4#曝气',
    code: 'M8-T2-Z4',
    group: POINTS_CONFIG.SOUTH
  },
  {
    name: '南池3#曝气',
    code: 'M6-T2-Z3',
    group: POINTS_CONFIG.SOUTH
  },
  {
    name: '南池2#曝气',
    code: 'M5-T2-Z2',
    group: POINTS_CONFIG.SOUTH
  },
  {
    name: '南池1#曝气',
    code: 'M4-T2-Z1',
    group: POINTS_CONFIG.SOUTH
  },
  {
    name: '北池4#曝气',
    code: 'M7-T1-Z4',
    group: POINTS_CONFIG.NORTH
  },
  {
    name: '北池3#曝气',
    code: 'M3-T1-Z3',
    group: POINTS_CONFIG.NORTH
  },
  {
    name: '北池2#曝气',
    code: 'M2-T1-Z2',
    group: POINTS_CONFIG.NORTH
  },
  {
    name: '北池1#曝气',
    code: 'M1-T1-Z1',
    group: POINTS_CONFIG.NORTH
  },
  {
    name: '鼓风机组主控柜 MCP',
    code: 'mcp',
    group: POINTS_CONFIG.MCP
  },
  {
    name: '北池控制系统',
    code: 'control-n',
    group: POINTS_CONFIG.CONTROL_N
  },
  {
    name: '南池控制系统',
    code: 'control-s',
    group: POINTS_CONFIG.CONTROL_S
  },
  {
    name: '总管压力',
    code: 'pressure',
    group: POINTS_CONFIG.PRESSURE
  },
  {
    name: '鼓凤机运行状态',
    code: 'run_state',
    group: POINTS_CONFIG.RUN_STATE
  },
  {
    name: '鼓风机组计算状态',
    code: 'gfj_state',
    group: POINTS_CONFIG.GFJ_STATE
  },
  {
    name: '北池溶解氧手自动状态',
    code: 'do_state_n',
    group: POINTS_CONFIG.DO_STATE_N
  },
  {
    name: '南池溶解氧手自动状态',
    code: 'dp_state_s',
    group: POINTS_CONFIG.DP_STATE_S
  }
];
