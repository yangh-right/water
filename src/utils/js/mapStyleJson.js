let mapStyleJson = [
  {
    featureType: 'land',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#041f47ff',
    },
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#00142fff',
    },
  },
  {
    featureType: 'green',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#12445eff',
    },
  },
  {
    featureType: 'building',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'building',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#dadada00',
    },
  },
  {
    featureType: 'subwaystation',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#091c35ff',
    },
  },
  {
    featureType: 'education',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#0d1b33ff',
    },
  },
  {
    featureType: 'medical',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#0d1b33ff',
    },
  },
  {
    featureType: 'scenicspots',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      color: '#17506fff',
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      weight: 4,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#081427ff',
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#037cb9ff',
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#06bbdfff',
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'arterial',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      weight: 2,
    },
  },
  {
    featureType: 'arterial',
    elementType: 'geometry.fill',
    stylers: {
      color: '#0c4c75ff',
    },
  },
  {
    featureType: 'arterial',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#00142fff',
    },
  },
  {
    featureType: 'arterial',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'arterial',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#06bbdfff',
    },
  },
  {
    featureType: 'arterial',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#042547ff',
    },
  },
  {
    featureType: 'local',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      weight: 1,
    },
  },
  {
    featureType: 'local',
    elementType: 'geometry.fill',
    stylers: {
      color: '#073c5eff',
    },
  },
  {
    featureType: 'local',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'local',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'local',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#08aecfff',
    },
  },
  {
    featureType: 'local',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#04254700',
    },
  },
  {
    featureType: 'railway',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      weight: 1,
    },
  },
  {
    featureType: 'railway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#ffffffff',
    },
  },
  {
    featureType: 'railway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#0070aaff',
    },
  },
  {
    featureType: 'subway',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
      weight: 1,
    },
  },
  {
    featureType: 'subway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#213f79ff',
    },
  },
  {
    featureType: 'subway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'subway',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'subway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#979c9aff',
    },
  },
  {
    featureType: 'subway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffffff',
    },
  },
  {
    featureType: 'continent',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'continent',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'continent',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#2dc4bbff',
    },
  },
  {
    featureType: 'continent',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'city',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'city',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'city',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#2dc4bbff',
    },
  },
  {
    featureType: 'city',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'town',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'town',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'town',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#454d50ff',
    },
  },
  {
    featureType: 'town',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffffff',
    },
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: {
      color: '#030514ff',
    },
  },
  {
    featureType: 'poilabel',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'districtlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#13547cff',
    },
  },
  {
    featureType: 'district',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'poilabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'poilabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#6f9dd8ff',
    },
  },
  {
    featureType: 'poilabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'manmade',
    elementType: 'geometry',
    stylers: {
      color: '#f5a623ff',
      visibility: 'off',
    },
  },
  {
    featureType: 'districtlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffffff',
    },
  },
  {
    featureType: 'entertainment',
    elementType: 'geometry',
    stylers: {
      color: '#0d1b33ff',
    },
  },
  {
    featureType: 'shopping',
    elementType: 'geometry',
    stylers: {
      color: '#0f4458ff',
    },
  },
  {
    featureType: 'highway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'highway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'highway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'highway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'highway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'highway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'nationalway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'nationalway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'nationalway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'nationalway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'nationalway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 6,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 7,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 8,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 9,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,10',
      level: 10,
    },
  },
  {
    featureType: 'provincialway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 8,
    },
  },
  {
    featureType: 'provincialway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 9,
    },
  },
  {
    featureType: 'provincialway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 10,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 8,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 9,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 10,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 8,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 9,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '8,10',
      level: 10,
    },
  },
  {
    featureType: 'cityhighway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 6,
    },
  },
  {
    featureType: 'cityhighway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 7,
    },
  },
  {
    featureType: 'cityhighway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 8,
    },
  },
  {
    featureType: 'cityhighway',
    stylers: {
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 9,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 6,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 7,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 8,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 9,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 6,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 7,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 8,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
      curZoomRegionId: '0',
      curZoomRegion: '6,9',
      level: 9,
    },
  },
  {
    featureType: 'subwaylabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'subwaylabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'tertiarywaysign',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'tertiarywaysign',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'provincialwaysign',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'provincialwaysign',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'nationalwaysign',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'nationalwaysign',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'highwaysign',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'highwaysign',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'village',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'district',
    elementType: 'labels.text',
    stylers: {
      fontsize: 20,
    },
  },
  {
    featureType: 'district',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#2dc4bbff',
    },
  },
  {
    featureType: 'district',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'country',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#2dc4bbff',
    },
  },
  {
    featureType: 'country',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#ffffffff',
    },
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#042547ff',
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#0c4c75ff',
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#00142fff',
    },
  },
  {
    featureType: 'tertiaryway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#0c4c75ff',
    },
  },
  {
    featureType: 'tertiaryway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#00142fff',
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#081427ff',
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#037cb9ff',
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#081427ff',
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#037cb9ff',
    },
  },
  {
    featureType: 'highway',
    elementType: 'labels.text',
    stylers: {
      fontsize: 20,
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#06bbdfff',
    },
  },
  {
    featureType: 'nationalway',
    elementType: 'labels.text',
    stylers: {
      fontsize: 20,
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#06bbdfff',
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'provincialway',
    elementType: 'labels.text',
    stylers: {
      fontsize: 20,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#06bbdfff',
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels.text',
    stylers: {
      fontsize: 20,
    },
  },
  {
    featureType: 'cityhighway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#042547ff',
    },
  },
  {
    featureType: 'estate',
    elementType: 'geometry',
    stylers: {
      color: '#0d1b33ff',
    },
  },
  {
    featureType: 'tertiaryway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#10b1d1ff',
    },
  },
  {
    featureType: 'tertiaryway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#042547ff',
    },
  },
  {
    featureType: 'fourlevelway',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#10b1d1ff',
    },
  },
  {
    featureType: 'fourlevelway',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#042547ff',
    },
  },
  {
    featureType: 'scenicspotsway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#073c5eff',
    },
  },
  {
    featureType: 'scenicspotsway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'universityway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#12223dff',
    },
  },
  {
    featureType: 'universityway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'vacationway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#12223dff',
    },
  },
  {
    featureType: 'vacationway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'fourlevelway',
    elementType: 'geometry',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'fourlevelway',
    elementType: 'geometry.fill',
    stylers: {
      color: '#0c4c75ff',
    },
  },
  {
    featureType: 'fourlevelway',
    elementType: 'geometry.stroke',
    stylers: {
      color: '#00142fff',
    },
  },
  {
    featureType: 'transportationlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'on',
    },
  },
  {
    featureType: 'transportationlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'transportationlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#608fccff',
    },
  },
  {
    featureType: 'transportationlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'educationlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'educationlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'educationlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#6f9dd8ff',
    },
  },
  {
    featureType: 'educationlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'transportation',
    elementType: 'geometry',
    stylers: {
      color: '#0d1b33ff',
    },
  },
  {
    featureType: 'airportlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#6f9dd8ff',
    },
  },
  {
    featureType: 'airportlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'scenicspotslabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#5e88bfff',
    },
  },
  {
    featureType: 'scenicspotslabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'medicallabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#6f9dd8ff',
    },
  },
  {
    featureType: 'medicallabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'medicallabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'scenicspotslabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'airportlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'entertainmentlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'entertainmentlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#5e88bfff',
    },
  },
  {
    featureType: 'entertainmentlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'estatelabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'estatelabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#6f9dd8ff',
    },
  },
  {
    featureType: 'estatelabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'businesstowerlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#5e88bfff',
    },
  },
  {
    featureType: 'businesstowerlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'businesstowerlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'companylabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#5e88bfff',
    },
  },
  {
    featureType: 'companylabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'companylabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'governmentlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'governmentlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#1da1ddff',
    },
  },
  {
    featureType: 'governmentlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'restaurantlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'restaurantlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'restaurantlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'hotellabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'hotellabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'hotellabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'shoppinglabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'shoppinglabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'shoppinglabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'lifeservicelabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'lifeservicelabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'lifeservicelabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'carservicelabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'carservicelabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'carservicelabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'financelabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#46769eff',
    },
  },
  {
    featureType: 'financelabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'financelabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'otherlabel',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#608fccff',
    },
  },
  {
    featureType: 'otherlabel',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff0',
    },
  },
  {
    featureType: 'otherlabel',
    elementType: 'labels.icon',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'building',
    elementType: 'geometry.fill',
    stylers: {
      color: '#d0021bff',
    },
  },
  {
    featureType: 'estatelabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'carservicelabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'financelabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'entertainmentlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'shoppinglabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'lifeservicelabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'hotellabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'restaurantlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'companylabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'otherlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'scenicspotslabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'businesstowerlabel',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'education',
    elementType: 'labels.text.fill',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'education',
    elementType: 'labels.text.stroke',
    stylers: {
      color: '#ffffff00',
    },
  },
  {
    featureType: 'transportation',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'scenicspots',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
  {
    featureType: 'medical',
    elementType: 'labels',
    stylers: {
      visibility: 'off',
    },
  },
];
export default mapStyleJson;
