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

      {/* Middle */}
      <div
        className="bg-repeat-y bg-[length:100%_auto] px-4 sm:px-8"
        style={{
          backgroundImage: `url(../${prefix}-middle.png)`,
        }}
      >
        <div className="w-full">
          {title && (
            <h2 className="text-xl sm:text-2xl font-rock text-yellow-200 tracking-wide text-center mb-6">
              {title}
            </h2>
          )}
          <div className="w-full">{children}</div>
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
