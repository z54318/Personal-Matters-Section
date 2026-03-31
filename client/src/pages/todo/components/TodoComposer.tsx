type TodoComposerProps = {
  value: string;
  tagValue: string;
  onChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSubmit: () => void;
};

// 渲染顶部新增事项输入区，支持同时录入标签。
export function TodoComposer({
  value,
  tagValue,
  onChange,
  onTagChange,
  onSubmit,
}: TodoComposerProps) {
  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="输入事项内容..."
          className="field-base flex-1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary sm:min-w-32"
        >
          新增事项
        </button>
      </div>

      <input
        type="text"
        value={tagValue}
        onChange={(event) => onTagChange(event.target.value)}
        placeholder="输入标签，多个标签用逗号分隔，例如：学习, 生活"
        className="field-base"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit();
          }
        }}
      />
    </div>
  );
}
