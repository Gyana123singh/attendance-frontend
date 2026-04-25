import { useState } from "react";

export default function WorkModal({ open, onClose, onCheckout }) {
  const [text, setText] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm">
        <h2 className="font-semibold mb-2">Add Work Entry</h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you do today?"
          className="w-full border p-2 h-24 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={() => onCheckout(text)} // 🔥 send description
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Check out
          </button>
        </div>
      </div>
    </div>
  );
}
