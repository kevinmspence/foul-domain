export default function ScrollWrapper({ title, children, size = "default" }) {
  const prefix = size === "large" ? "scroll" : "scroll";

  return (
    <div className="w-full max-w-full flex flex-col items-stretch drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
      {/* Top */}
      <img
        src={`../${prefix}-top.png`}
        alt="Scroll top"
        className="w-full"
        draggable={false}
      />

      {/* Middle – Repeat scroll-middle.png as a tiled img */}
      <div className="w-full relative">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full"
            style={{
              backgroundImage: `url(../${prefix}-middle.png)`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '100% auto',
            }}
          >
            <div className="invisible">.</div>
          </div>
        </div>

        {/* Content over background */}
        <div className="relative z-10 px-4 sm:px-8 pt-6 pb-8">
          {title && (
            <h2 className="text-xl sm:text-2xl font-rock text-yellow-200 tracking-wide text-center mb-6">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>

      {/* Bottom */}
      <img
        src={`../${prefix}-bottom.png`}
        alt="Scroll bottom"
        className="w-full"
        draggable={false}
      />
    </div>
  );
}
