import { Component, ViewEncapsulation } from '@angular/core';

import * as go from 'gojs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'test';

  initDiagram(): go.Diagram {
    const myDiagram = new go.Diagram({
      'undoManager.isEnabled': true,
    });

    const propertyTemplate = new go.Panel('Horizontal', { padding: 5 })
        .add(
          // property name, underlined if scope=="class" to indicate static property
          new go.TextBlock({ isMultiline: false, editable: true })
            .bindTwoWay('text', 'name')
            .bind('isUnderline', 'scope', s => s[0] === 'c'),
          // property type, if known
          new go.TextBlock('')
            .bind('text', 'type', t => t ? ':' : ''),
          new go.TextBlock({ isMultiline: false, editable: true })
            .bindTwoWay('text', 'type'),
          // property default value, if any
          new go.TextBlock({ isMultiline: false, editable: false })
            .bind('text', 'default', s => s ? ' = ' + s : '')
        );


    myDiagram.nodeTemplate =
        new go.Node('Auto', {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides
        })
          .add(
            new go.Shape('RoundedRectangle', { fill: 'lightyellow'}),
            new go.Panel('Table', { defaultRowSeparatorStroke: 'black' })
              .add(
                // header
                new go.TextBlock({
                  row: 0, columnSpan: 2, margin: 10, alignment: go.Spot.Center, 
                  font: 'bold 12pt sans-serif',
                  isMultiline: false, editable: true
                })
                  .bindTwoWay('text', 'name'),
                // properties
                new go.TextBlock('Properties', { row: 1, font: 'italic 11pt sans-serif', margin: 10 })
                  .bindObject('visible', 'visible', v => !v, undefined, 'PROPERTIES'),
                new go.Panel('Vertical', {
                  name: 'PROPERTIES',
                  row: 1,
                  margin: 3,
                  stretch: go.Stretch.Horizontal,
                  defaultAlignment: go.Spot.Left,
                  background: 'lightyellow',
                  itemTemplate: propertyTemplate
                })
                  .bind('itemArray', 'properties'),
                go.GraphObject.build("PanelExpanderButton", {
                  row: 1,
                  column: 1,
                  margin: 3,
                  alignment: go.Spot.TopRight,
                  visible: false
                }, "PROPERTIES")
                  .bind('visible', 'properties', arr => arr.length > 0),
              )
          );

    function linkStyle() {
      return { isTreeLink: false, fromEndSegmentLength: 0, toEndSegmentLength: 0 };
    }

    myDiagram.linkTemplate = new go.Link({ // by default, "Inheritance" or "Generalization"
      ...linkStyle(),
      isTreeLink: true
    })
    .add(
      new go.Shape(),
      new go.Shape({ toArrow: 'Triangle', fill: 'white' })
    );

    myDiagram.linkTemplateMap.add('Association',
      new go.Link(linkStyle())
        .add(
          new go.Shape()
        ));

    myDiagram.linkTemplateMap.add('Realization',
      new go.Link(linkStyle())
        .add(
          new go.Shape({ strokeDashArray: [3, 2] }),
          new go.Shape({ toArrow: 'Triangle', fill: 'white' })
        ));

    myDiagram.linkTemplateMap.add('Dependency',
      new go.Link(linkStyle())
        .add(
          new go.Shape({ strokeDashArray: [3, 2] }),
          new go.Shape({ toArrow: 'OpenTriangle' })
        ));

    myDiagram.linkTemplateMap.add('Composition',
      new go.Link(linkStyle())
        .add(
          new go.Shape(),
          new go.Shape({ fromArrow: 'StretchedDiamond', scale: 1.3 }),
          // new go.Shape({ toArrow: 'OpenTriangle' })
        ));

    myDiagram.linkTemplateMap.add('Aggregation',
      new go.Link(linkStyle())
        .add(
          new go.Shape(),
          new go.Shape({ fromArrow: 'StretchedDiamond', fill: 'white', scale: 1.3 }),
          new go.Shape({ toArrow: 'OpenTriangle' })
        ));

    const nodedata: go.ObjectData[] = [
      {
        key: 1,
        name: 'BankAccount',
        properties: [
          { name: 'owner', type: 'String', visibility: 'public' },
          { name: 'balance', type: 'Currency', visibility: 'public', default: '0' }
        ]
      },
      {
        key: 11,
        name: 'Person',
        properties: [
          { name: 'name', type: 'String', visibility: 'public' },
          { name: 'birth', type: 'Date', visibility: 'protected' }
        ]
      },
      {
        key: 12,
        name: 'Student',
        properties: [
          { name: 'classes', type: 'List<Course>', visibility: 'public' }
        ]
      },
      {
        key: 13,
        name: 'Professor',
        properties: [
          { name: 'classes', type: 'List<Course>', visibility: 'public' }
        ]
      },
      {
        key: 14,
        name: 'Course',
        properties: [
          { name: 'name', type: 'String', visibility: 'public' },
          { name: 'description', type: 'String', visibility: 'public' },
          { name: 'professor', type: 'Professor', visibility: 'public' },
          { name: 'location', type: 'String', visibility: 'public' },
          { name: 'times', type: 'List<Time>', visibility: 'public' },
          { name: 'prerequisites', type: 'List<Course>', visibility: 'public' },
          { name: 'students', type: 'List<Student>', visibility: 'public' }
        ],
        //should figure out a better way to fix this sometime
      }
    ];

    const linkdata: go.ObjectData[] = [
      { from: 12, to: 11 },
      { from: 13, to: 11, relationship: 'Dependency' },
      { from: 14, to: 13, relationship: 'Association' }
    ];

    myDiagram.model = new go.GraphLinksModel(
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        linkCategoryProperty: 'relationship',
        nodeDataArray: nodedata,
        linkDataArray: linkdata
      });

    return myDiagram;
  }
}
