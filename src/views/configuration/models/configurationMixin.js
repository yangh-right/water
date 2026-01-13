import 'svg.js';
import 'svg.draw.js';
import { SvgStyleConfig } from './data';
import { getSvgModulePage } from '@/api/configuration';
/* eslint-disable no-undef */
export const reRenderComponent = {
  data() {
    return {
      svgDraw: null,
      isInit: true,
      syncComponentMap: {}
    };
  },
  activated() {
    if (this.isInit) {
      this.isInit = false;
    } else {
      if (Object.keys(this.syncComponentMap)?.length) {
        Object.values(this.syncComponentMap).forEach(item => {
          const { componentId, isEdit } = item;
          this.syncComponents(componentId, isEdit);
        });
      }
      this.syncComponentMap = {};
    }
  },
  methods: {
    getSvgElementIdList() {
      return [];
    },
    async syncComponents(componentId, isEdit = true) {
      if (componentId && this._inactive) {
        this.syncComponentMap[componentId] = { componentId, isEdit };
        return;
      }
      let svgDataList = await this.updateComponentData(componentId);
      svgDataList?.forEach(component => {
        this.updateComponentElement(this.svgElementAttributeObj[component.domId], isEdit);
      });
    },
    async updateComponentData(componentId) {
      let svgDataList = this.getSvgElementIdList()
        .filter(item => {
          let id = this.svgElementAttributeObj?.[item?.svgElementId]?.componentId;
          if (componentId) {
            return componentId === id;
          } else {
            return id;
          }
        })
        .map(item => this.svgElementAttributeObj[item.svgElementId]);
      let componentMap = await this.getComponentMap();
      //同步组件配置数据
      svgDataList?.forEach(component => {
        if (!componentMap?.[component.componentId]) return;
        this.svgElementAttributeObj[component.domId] = {
          ...componentMap[component.componentId],
          componentId: component.componentId,
          videoCode: component.videoCode,
          videoOriginCode: component.videoOriginCode,
          videoType: component.videoType,
          deviceId: component.deviceId,
          deviceName: component.deviceName,
          domId: component.domId,
          axisX: component.axisX,
          axisY: component.axisY
        };
        if (componentMap[component.componentId]) {
          let textOptionsList = [...(componentMap[component.componentId]?.textOptionsList ?? [])];
          if (textOptionsList.length) {
            textOptionsList[2] = component.textOptionsList?.[2] || '';
            this.svgElementAttributeObj[component.domId].textOptionsList = textOptionsList;
          }
        }
      });
      return svgDataList;
    },
    //更新组件元素
    updateComponentElement(svgElementData, isEdit = true) {
      this.renderElement(svgElementData, isEdit);
    },
    renderElement(svgElementData, isEdit = true) {
      let svgElementId = svgElementData.domId;
      if (!svgElementId) {
        return false;
      }
      if (isEdit) {
        if (svgElementData.axisX <= 0) svgElementData.axisX = 0;
        if (svgElementData.axisY <= 0) svgElementData.axisY = 0;
      }
      let svgElement = SVG.get(svgElementId);
      switch (svgElementData.svgElementType) {
        case 'com': {
          const rect = SVG.get(svgElement.node.childNodes[0].id);
          const circle = SVG.get(svgElement.node.childNodes[1].id);
          const text = SVG.get(svgElement.node.childNodes[2].id);
          const name = SVG.get(svgElement.node.childNodes[3].id);
          if (isEdit) {
            svgElementData.inspOrder = text.text();
            svgElementData.inspDev = svgElementData.devInfo?.key || '';
          }
          if (svgElementData.devInfo) {
            name.text(svgElementData.inspName + '-' + svgElementData.devInfo.label.trim());
          }
          const val = svgElementData.devInfo?.label
            ? svgElementData.inspName + svgElementData.devInfo.label
            : svgElementData.inspName;
          const len = val.length * 10 + 70;
          const group = SVG.get(svgElement.node.id);
          group.attr({ width: len });
          rect.attr({ width: len });
          const moveX = svgElementData.axisX - rect.attr('x');
          const moveY = svgElementData.axisY - rect.attr('y');
          rect.attr('x', rect.attr('x') + moveX);
          rect.attr('y', rect.attr('y') + moveY);
          circle.attr('cx', circle.attr('cx') + moveX);
          circle.attr('cy', circle.attr('cy') + moveY);
          text.attr('x', text.attr('x') + moveX);
          text.attr('y', text.attr('y') + moveY);
          name.attr('x', name.attr('x') + moveX);
          name.attr('y', name.attr('y') + moveY);
          const order = SVG.get(text.node.childNodes[0].id);
          order.attr('x', text.attr('x') + moveX);
          const nameText = SVG.get(name.node.childNodes[0].id);
          nameText.attr('x', name.attr('x') + moveX);
          break;
        }
        case 'alarm': {
          const name = SVG.get(svgElement.node.childNodes[3].id);
          name.text(svgElementData.alarmName);
          const rect = SVG.get(svgElement.node.childNodes[0].id);
          const circle = SVG.get(svgElement.node.childNodes[1].id);
          const leve = SVG.get(svgElement.node.childNodes[2].id);
          const w = Math.max(150, svgElementData.alarmName.length * 20 + 40);
          rect.attr({ width: w });
          const moveX = svgElementData.axisX - rect.attr('x');
          const moveY = svgElementData.axisY - rect.attr('y');
          rect.attr('x', rect.attr('x') + moveX);
          rect.attr('y', rect.attr('y') + moveY);
          circle.attr('cx', circle.attr('cx') + moveX);
          circle.attr('cy', circle.attr('cy') + moveY);
          name.attr('x', name.attr('x') + moveX);
          name.attr('y', name.attr('y') + moveY);
          leve.attr('x', leve.attr('x') + moveX);
          leve.attr('y', leve.attr('y') + moveY);
          const group = SVG.get(svgElement.node.id);
          group.attr({ width: rect.attr('width') });
          break;
        }
        case 'point': {
          this.updatePointStyle(svgElementData, svgElement, isEdit);
          break;
        }
        case 'img':
          svgElement.attr('x', svgElementData.axisX);
          svgElement.attr('y', svgElementData.axisY);
          break;
        case 'text':
          svgElement.text(svgElementData.value);
          svgElement.attr('fill', svgElementData.fill);
          svgElement.attr('x', svgElementData.axisX);
          svgElement.attr('y', svgElementData.axisY);
          svgElement.attr('style', 'font-size:' + svgElementData.fontSize + 'px');
          break;
        case 'rect':
          svgElement.attr('fill', svgElementData.fill);
          svgElement.attr('x', svgElementData.axisX);
          svgElement.attr('y', svgElementData.axisY);
          break;
        case 'circle':
          svgElement.attr('fill', svgElementData.fill);
          svgElement.attr('cx', svgElementData.axisX);
          svgElement.attr('cy', svgElementData.axisY);
          break;
        case 'line': {
          let upX = parseInt(svgElementData.axisX) - parseInt(svgElement.attr('x1'));
          let upY = parseInt(svgElementData.axisY) - parseInt(svgElement.attr('y1'));
          svgElement.stroke({ width: svgElementData.strokeWith, color: svgElementData.stroke });
          svgElement.attr('x1', svgElementData.axisX);
          svgElement.attr('y1', svgElementData.axisY);
          svgElement.attr('x2', parseInt(svgElement.attr('x2')) + upX);
          svgElement.attr('y2', parseInt(svgElement.attr('y2')) + upY);
          if (svgElementData.animate && svgElementData.animate === '1') {
            svgElement.addClass('supply-runing');
          } else {
            svgElement.removeClass('supply-runing');
          }
          break;
        }
        case 'triangle': {
          svgElement.attr('fill', svgElementData.fill);
          let oldAttr = svgElement.attr('points').split(' ');
          let oldAttrNumX1 = parseInt(oldAttr[0].split(',')[0]);
          let oldAttrNumY1 = parseInt(oldAttr[0].split(',')[1]);
          let oldAttrNumX2 = parseInt(oldAttr[1].split(',')[0]);
          let oldAttrNumY2 = parseInt(oldAttr[1].split(',')[1]);
          let oldAttrNumX3 = parseInt(oldAttr[2].split(',')[0]);
          let oldAttrNumY3 = parseInt(oldAttr[2].split(',')[1]);
          let addX = svgElementData.axisX - oldAttrNumX1;
          let addY = svgElementData.axisY - oldAttrNumY1;
          let points = svgElementData.axisX + ',' + svgElementData.axisY + ' ';
          points += oldAttrNumX2 + addX + ',' + (oldAttrNumY2 + addY) + ' ';
          points += oldAttrNumX3 + addX + ',' + (oldAttrNumY3 + addY) + ' ';
          svgElement.attr('points', points);
          break;
        }
      }
      return svgElement;
    },
    updatePointStyle(svgElementData, svgElement, isEdit = true) {
      const group = SVG.get(svgElement.node.id);
      const react = SVG.get(svgElement.node.childNodes[0].id);
      const control = SVG.get(svgElement.node.childNodes[1].id);
      const name = SVG.get(svgElement.node.childNodes[2].id);
      const value = SVG.get(svgElement.node.childNodes[3].id);
      const unit = SVG.get(svgElement.node.childNodes[4].id);
      const pointStyle = SvgStyleConfig.point;
      let pointCodeList = [];
      svgElementData.codeElementObj.codeId = svgElementData.codeElementObj.codeId || '';
      if (svgElementData.codeElementObj.codeId.includes(',')) {
        pointCodeList = svgElementData.codeElementObj.codeId.split(',');
      }
      let bgWidth;
      if (svgElementData.bgWidth === 'custom') {
        bgWidth = svgElementData.customWidth || pointStyle.bodyCustomWidth;
      } else {
        bgWidth = svgElementData.bgWidth ? Number(svgElementData.bgWidth) : pointStyle.bodyWidth;
      }

      let nameText = svgElementData.codeElementObj.relationPoint || '';
      const pointUnit = svgElementData.codeElementObj.pointUnit
        ? svgElementData.codeElementObj.pointUnit
        : '';

      name.text(nameText);
      if (nameText) {
        name.show();
      } else {
        name.hide();
      }
      unit.text(pointUnit);
      if (pointUnit) {
        unit.show();
      } else {
        unit.hide();
      }
      react.attr('fill', svgElementData.fill);
      // react.attr({
      //   stroke: '#D1E4E3',
      //   strokeWidth: '1',
      //   rx: '2'
      // });
      name.attr('font-family', pointStyle.nameFamily);
      name.fill(pointStyle.nameColor);
      name.attr('font-size', pointStyle.nameSize);
      name.attr('font-weight', '400');
      value.text(isEdit ? '0' : '--');

      value.fill(pointStyle.valueColor);
      value.attr('font-size', pointStyle.valueSize);
      value.attr('font-family', pointStyle.valueFamily);
      value.attr('font-weight', '400');
      unit.fill(pointStyle.unitColor);
      unit.attr('font-family', pointStyle.unitFamily);
      unit.attr('font-size', pointStyle.unitSize);
      unit.attr('font-weight', '400');

      const moveX = svgElementData.axisX - react.attr('x');
      const moveY = svgElementData.axisY - react.attr('y');
      react.attr('y', react.attr('y') + moveY);
      react.attr('x', react.attr('x') + moveX);
      name.attr('x', react.attr('x') + 10);

      name.attr('y', react.attr('y') + pointStyle.nameTop);
      unit.attr('y', react.attr('y') + pointStyle.unitTop);
      value.attr('y', react.attr('y') + pointStyle.valueTop);
      control.attr('y', react.attr('y') + pointStyle.controlTop);
      control.attr({ width: pointStyle.controlHeight, height: pointStyle.controlHeight });
      const unitWidth = pointStyle.unitWidth;
      if (svgElementData.isControl == '1') {
        control.attr('x', react.attr('x') + bgWidth - pointStyle.controlHeight - 10);
        unit.attr('x', control.attr('x') - 6 - unitWidth);
      } else {
        unit.attr('x', react.attr('x') + bgWidth - 10 - unitWidth);
      }
      let valueX = unit.attr('x') - value.length() - 4;
      value.attr('x', valueX);
      // const valueChild = SVG.get(value.node.childNodes[0].id);
      // valueChild.attr('x', valueX);
      // svgElement.node.childNodes.forEach(item => {
      //   SVG.get(item.id)?.attr('opacity', 1);
      // });
      this.updateMultiplePoints({
        element: svgElement.node,
        svgElementAttribute: svgElementData,
        group,
        value,
        unit,
        control,
        react,
        pointCodeList,
        realPointDataList: pointCodeList,
        isShowControl: svgElementData.isControl === '1',
        isEdit: isEdit
      });
      react.attr({ width: bgWidth, height: pointStyle.bodyHeight });
      group.attr({ width: react.attr('width'), height: pointStyle.bodyHeight });
    },
    updateMultiplePoints(config) {
      const {
        element,
        svgElementAttribute,
        group,
        value,
        unit,
        control,
        react,
        pointCodeList,
        realPointDataList,
        isShowControl,
        isEdit
      } = config;
      const pointStyle = SvgStyleConfig.point;
      let bgWidth;
      if (svgElementAttribute.bgWidth === 'custom') {
        bgWidth = svgElementAttribute.customWidth || pointStyle.bodyCustomWidth;
      } else {
        bgWidth = svgElementAttribute.bgWidth
          ? Number(svgElementAttribute.bgWidth)
          : pointStyle.bodyWidth;
      }
      const pointUnit = svgElementAttribute.codeElementObj.pointUnit
        ? svgElementAttribute.codeElementObj.pointUnit
        : '';
      let points = null;
      if (element.childNodes[5]?.attributes?.name?.nodeValue !== 'multiplePoint') {
        let oItems = element.childNodes.length;
        let oldPointElements = [];
        for (let i = 0; i < oItems; i++) {
          if (i > 4 && element.childNodes[i]) {
            oldPointElements.push(element.childNodes[i]);
          }
        }
        oldPointElements.forEach(item => {
          element.removeChild(item);
        });
        points = this.svgDraw.group().attr({ name: 'multiplePoint' });
        group.add(points);
      }
      points = SVG.get(element.childNodes[5].id);
      if (pointCodeList.length) {
        value.hide();
        unit.hide();
        control.hide();
        points.show();
        points.clear();
        let pointsWidth = bgWidth - 12 - 60;
        let pointsX = 70;
        points
          .attr('x', react.attr('x') + pointsX)
          .attr('y', react.attr('y'))
          .attr('width', pointsWidth)
          .attr('height', pointStyle.bodyHeight);
        let len = realPointDataList.length;
        let width = pointsWidth / len;
        realPointDataList.forEach((point, index) => {
          let value = this.svgDraw
            .text(!isEdit ? (point.pointValue ?? '--') + '' : '0')
            .attr('font-size', pointStyle.valueSize)
            .fill(pointStyle.valueColor)
            .attr('font-weight', '400')
            .attr('font-family', pointStyle.valueFamily);

          value
            .attr('y', react.attr('y') + pointStyle.valueTop)
            .attr('x', react.attr('x') + pointsX + index * width + width - 12 - value.length());

          points.add(value);
          if (!isEdit) {
            let valueDom = value.node;
            valueDom.addEventListener('click', () => {
              this.$emit('element:click', element, svgElementAttribute, 'point');
            });
          }
          if (index < realPointDataList.length - 1) {
            let split = this.svgDraw
              .rect(2, pointStyle.splitHeight)
              .attr({
                x: react.attr('x') + pointsX + index * width + width - 2,
                y: react.attr('y') + pointStyle.splitTop
              })
              .fill('#ddd');
            points.add(split);
          }
        });
      } else {
        points.clear();
        points.hide();
        value.show();
        if (pointUnit) {
          unit.show();
        } else {
          unit.hide();
        }
        if (isShowControl) {
          control.show();
        } else {
          control.hide();
        }
      }
    },
    async getComponentMap() {
      const res = await getSvgModulePage({ page: { size: 10000, current: 1 } });
      let componentMap = {};
      res?.resultData?.records?.forEach(item => {
        componentMap[item.id] = item.configJson ? JSON.parse(item.configJson) : null;
      });
      return componentMap;
    }
  }
};
