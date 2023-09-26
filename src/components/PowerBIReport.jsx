import React from 'react'
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import PowerBIConfig from '../db/PowerBI.json'
import './styles/PowerBI.scss'

function PowerBIReport() {
  return (
    <div>
      <PowerBIEmbed
        embedConfig={{
          type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
          id: PowerBIConfig.id,
          embedUrl: PowerBIConfig.embedUrl,
          accessToken: PowerBIConfig.accessToken,
          tokenType: models.TokenType.Aad, // Use models.TokenType.Aad for SaaS embed
          settings: {
            panes: {
              // bookmarks: {
              //   visible: true
              // },
              fields: {
                expanded: false
              },
              filters: {
                expanded: false,
                visible: true
              },
              pageNavigation: {
                visible: false
              },
              selection: {
                visible: true
              },
              syncSlicers: {
                visible: true
              },
              visualizations: {
                expanded: false
              }
            },
            background: models.BackgroundType.Transparent,
          }
        }}

        eventHandlers={
          new Map([
            ['loaded', function () { console.log('Report loaded'); }],
            ['rendered', function () { console.log('Report rendered'); }],
            ['error', function (event) { console.log(event.detail); }],
            ['visualClicked', () => console.log('visual clicked')],
            ['pageChanged', (event) => console.log(event)],
          ])
        }

        cssClassName={"reportClass"}

        getEmbeddedComponent={(embeddedReport) => {
          window.report = embeddedReport;
        }}
      />
    </div>
  )
}

export default PowerBIReport