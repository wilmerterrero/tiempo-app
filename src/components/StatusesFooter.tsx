type StatusesFooterProps = {
  loading: boolean;
  error: boolean;
};
export const StatusesFooter = ({ loading, error }: StatusesFooterProps) => {
  return (
    <footer className="flex justify-center items-center">
      {loading && (
        <div className="bg-info w-full text-center font-bold text-xs text-info-content">
          Loading...
        </div>
      )}
      {error && (
        <div className="bg-error w-full text-center font-bold text-xs text-error-content">
          Error detected
        </div>
      )}
    </footer>
  );
};
