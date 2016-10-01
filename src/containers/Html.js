import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom/server';
import Helmet from 'react-helmet';
import Body from './Body';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  }

  render() {
    const {assets, component, store} = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';
    const head = Helmet.rewind();

    return (
      <html lang="en-us">
        <head>
          {head.base.toComponent()}
          {head.title.toComponent()}
          {head.meta.toComponent()}
          {head.link.toComponent()}
          {head.script.toComponent()}
          <link rel="shortcut icon" href="/images/favicon.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <link href="https://fonts.googleapis.com/css?family=Graduate|Telex|Metrophobic" rel="stylesheet" type="text/css" />
        	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css" />
        	<link rel="shortcut icon" href="favicon.ico" type="./favicon.ico"/>

        	<link rel="stylesheet" href="/css/normalize.css" />
        	<link rel="stylesheet" type="text/css" href="/css/style.css" />
        	<link rel="stylesheet" type="text/css" href="/css/colors.css" />

          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}
        </head>
        <Body assets={assets} content={content} store={store} />
      </html>
    );
  }
}
