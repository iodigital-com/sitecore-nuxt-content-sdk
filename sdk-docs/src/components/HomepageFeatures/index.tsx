import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Nuxt & Vue support',
    Svg: require('@site/static/img/feature-nuxt.svg').default,
    description: (
      <>
        Purpose-built packages for Nuxt and Vue. Drop them into your project and start building
        Sitecore-powered pages straight away.
      </>
    ),
  },
  {
    title: 'Routing & rendering',
    Svg: require('@site/static/img/feature-routing.svg').default,
    description: (
      <>
        Handles Sitecore routing, layout rendering, and component mapping so you can focus on
        building components instead of wiring up integrations.
      </>
    ),
  },
  {
    title: 'Open source',
    Svg: require('@site/static/img/feature-opensource.svg').default,
    description: (
      <>
        The SDK is open source and built to be extended. Swap out defaults, add your own middleware,
        or contribute back to the project.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
