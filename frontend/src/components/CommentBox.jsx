import { useState } from 'react';

export const CommentBox = ({ onCommentChange = () => {} }) => {
  const [comment, setComment] = useState('');

  const handleChange = (e) => {
    setComment(e.target.value);
    onCommentChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase">
        Comment
      </label>
      <textarea
        value={comment}
        onChange={handleChange}
        placeholder="Add any notes or comments about this task..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows="3"
      />
      <div className="flex justify-end mt-2">
        <p className="text-xs text-gray-500">
          {comment.length} / 1000
        </p>
      </div>
    </div>
  );
};
