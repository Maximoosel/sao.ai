const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
      <span className="text-5xl mb-4">✦</span>
      <h3 className="text-lg font-semibold text-foreground mb-1">You're all clear here</h3>
      <p className="text-sm text-muted-foreground">No files found in this category</p>
    </div>
  );
};

export default EmptyState;
