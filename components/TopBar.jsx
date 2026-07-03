const TopBar = () => (
  <div className="h-11 shrink-0 bg-[#3a1a3d] flex items-center px-3 gap-4 text-white">
    <div className="flex items-center gap-2 text-[#d1c8d3]">
      <ChevronLeft className="size-4" />
      <ChevronRight className="size-4" />
      <Clock className="size-4" />
    </div>
    <div className="flex-1 flex justify-center">
      <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-md px-3 py-1.5 w-[420px] text-[13px] text-[#d1c8d3] cursor-text">
        <Search className="size-4" />
        Search Hack Club
      </div>
    </div>
    <div className="flex items-center gap-3 text-[#d1c8d3]">
      <HelpCircle className="size-4" />
      <div className="flex items-center gap-2 border-l border-white/15 pl-3">
        <Minus className="size-4" />
        <Square className="size-3.5" />
        <X className="size-4" />
      </div>
    </div>
  </div>
);
