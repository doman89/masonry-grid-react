import { useCallback, useEffect, useRef, useState, FC } from 'react';

interface MasonryGridWrapperProps {
  additionalClass?: string;
}

const MansoryGridWrapper: FC<MasonryGridWrapperProps> = ({ additionalClass, children }) => {
  const [isDOMReady, setIsDOMReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resizeElement = (element: HTMLElement) => {
    if (!wrapperRef.current) {
      return;
    }

    const { current: wrapper } = wrapperRef;
    const rowHeight = Number.parseInt(getComputedStyle(wrapper).getPropertyValue('grid-auto-rows'));
    const rowGap = Number.parseInt(getComputedStyle(wrapper).getPropertyValue('grid-row-gap'));
    const rowSpan = Math.ceil(
      (element.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap),
    );

    if (rowSpan) {
      element.style.gridRowEnd = `span ${rowSpan}`;
    }
  };

  const resizeElements = useCallback(() => {
    Array.from(wrapperRef.current!.children).forEach(child => resizeElement(child as HTMLElement));
  }, []);

  useEffect(() => {
    if (!isDOMReady) {
      setIsDOMReady(true);
    } else {
      resizeElements();
    }
  }, [isDOMReady, resizeElements]);

  useEffect(() => {
    if (!isDOMReady || !wrapperRef.current) {
      return;
    }

    const config: MutationObserverInit = { attributes: false, childList: true, subtree: false };
    const observer = new MutationObserver(mutationsList =>
      mutationsList.forEach(({ type }) => {
        if (type === 'childList') {
          resizeElements();
        }
      }),
    );

    observer.observe(wrapperRef.current, config);
    window.addEventListener('resize', resizeElements);

    return () => {
      window.removeEventListener('resize', resizeElements);
      observer.disconnect();
    };
  }, [isDOMReady, resizeElements]);

  return (
    <div
      className={`masonry-grid ${additionalClass ? additionalClass : ''}`}
      ref={wrapperRef}
      style={{ display: 'grid' }}
    >
      {children}
    </div>
  );
};

export default MansoryGridWrapper;
