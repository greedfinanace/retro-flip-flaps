type AdUnitProps = {
  unitId?: string;
};

export function AdUnit({ unitId = '2432002' }: AdUnitProps) {
  return (
    <div
      id="frame"
      style={{
        width: '100%',
        margin: 'auto',
        position: 'relative',
        zIndex: 99998,
      }}
    >
      <iframe
        data-aa={unitId}
        src={`//acceptable.a-ads.com/${unitId}/?size=Adaptive`}
        style={{
          border: 0,
          padding: 0,
          width: '70%',
          height: 'auto',
          overflow: 'hidden',
          display: 'block',
          margin: 'auto',
        }}
      />
    </div>
  );
}
