import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUnsavedChanges } from '../../context/UnsavedChangesContext';
import '../Dashboard/Dashboard.css';

const CreateAssessment = ({ user, setActiveTab }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('mcq');
  const [timeLimit, setTimeLimit] = useState(0);
  const [targetClasses, setTargetClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { setHasUnsavedChanges } = useUnsavedChanges();

  useEffect(() => {
    // If any field deviates from its initial empty state, mark as dirty
    if (title || description || questions.length > 1 || questions[0].questionText !== '' || timeLimit > 0) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [title, description, questions, timeLimit, setHasUnsavedChanges]);
  
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/classes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAvailableClasses(data);
    } catch(err) { console.error(err); }
  };
  
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/assessments/upload-pdf', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          toast.success(`Successfully parsed ${data.questions.length} questions from PDF!`);
        } else {
          toast.error('Could not find any questions in the expected format in this PDF.');
        }
      } else {
        toast.error(data.error || 'Failed to parse PDF');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading PDF');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSave = async () => {
    if (!title) { toast.error('Title is required'); return; }
    // Basic validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText) { toast.error(`Question ${i+1} text is required`); return; }
      if (type === 'mcq' && !questions[i].correctAnswer) { toast.error(`Question ${i+1} correct answer is required`); return; }
    }

    try {
      const res = await fetch(import.meta.env.VITE_BASE_URL + '/api/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, description, type, timeLimit, questions, targetClasses, createdBy: user._id || user.id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Assessment created successfully!');
        setHasUnsavedChanges(false); // Clear before navigating
        setActiveTab('assessments');
      } else {
        toast.error(data.error || 'Failed to create assessment');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error creating assessment');
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => setActiveTab('assessments')}
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Assessments
      </button>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Create New Assessment</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label htmlFor="assessment-title" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
            <input 
              id="assessment-title"
              type="text" 
              className="transparent-input"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
            />
          </div>
          
          <div>
            <label htmlFor="assessment-description" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
            <textarea 
              id="assessment-description"
              className="transparent-input"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '100px' }} 
            />
          </div>

          <div>
            <label htmlFor="assessment-type" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Type</label>
            <select 
              id="assessment-type"
              className="transparent-input"
              value={type} 
              onChange={e => setType(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="mcq">MCQ / Multiple Choice</option>
            </select>
          </div>

          <div>
            <label htmlFor="assessment-time-limit" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Time Limit (Minutes)</label>
            <input 
              id="assessment-time-limit"
              type="number" 
              className="transparent-input"
              value={timeLimit} 
              onChange={e => setTimeLimit(parseInt(e.target.value) || 0)} 
              min="0"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
            />
            <small style={{ color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>Enter 0 for no time limit.</small>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="assessment-target-classes" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Classes</label>
            <select 
              id="assessment-target-classes"
              multiple 
              className="transparent-input"
              value={targetClasses} 
              onChange={e => setTargetClasses(Array.from(e.target.selectedOptions, option => option.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', minHeight: '80px' }}
            >
              {availableClasses.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.year})</option>
              ))}
            </select>
            <small style={{ color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>Hold Cmd/Ctrl to select multiple. Leave empty for all.</small>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Questions</h3>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileUpload} 
              aria-label="Upload PDF"
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              disabled={isUploading}
            />
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isUploading}>
              <Upload size={18} /> {isUploading ? 'Parsing...' : 'Upload PDF'}
            </button>
          </div>
        </div>
        
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', position: 'relative', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => removeQuestion(qIndex)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
            >
              <Trash2 size={20} />
            </button>
            
            <label htmlFor={`question-${qIndex}-text`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Question {qIndex + 1}</label>
            <textarea 
              id={`question-${qIndex}-text`}
              className="transparent-input"
              value={q.questionText}
              onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
              placeholder="Enter question text..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginBottom: '1rem' }}
            />

            {type === 'mcq' && (
              <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--accent-primary)' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Options</span>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <label htmlFor={`question-${qIndex}-option-${oIndex}`} style={{ color: 'var(--text-tertiary)' }}>{String.fromCharCode(65 + oIndex)}.</label>
                    <input 
                      id={`question-${qIndex}-option-${oIndex}`}
                      type="text"
                      className="transparent-input"
                      value={opt}
                      onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <label htmlFor={`correct-${qIndex}-${oIndex}`} className="sr-only" style={{ display: 'none' }}>Mark Option {String.fromCharCode(65 + oIndex)} as correct</label>
                    <input 
                      id={`correct-${qIndex}-${oIndex}`}
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctAnswer === opt && opt !== ''}
                      onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)}
                      title="Mark as correct answer"
                      aria-label={`Mark Option ${String.fromCharCode(65 + oIndex)} as correct`}
                    />
                  </div>
                ))}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>* Select the radio button next to the correct option.</p>
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={addQuestion}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Add Question
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
          >
            <Save size={18} /> Save Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
