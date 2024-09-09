import React, { useState } from 'react';
import { Modal, TextField, Select, MenuItem, RadioGroup, FormControlLabel, Radio, IconButton, CircularProgress, Fade } from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon, BugReport, Lightbulb, MoreHoriz, Email, AttachFile, Feedback as FeedbackIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import * as Tooltip from "@radix-ui/react-tooltip";

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    issueType: 'bug',
    description: '',
    severity: 'medium',
    email: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('issueType', feedback.issueType);
      formData.append('description', feedback.description);
      formData.append('severity', feedback.severity);
      formData.append('email', feedback.email);
      files.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        handleClose();
        setFeedback({ issueType: 'bug', description: '', severity: 'medium', email: '' });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <>
    <style jsx global>{`
      #radix-tooltip {
        z-index: 1500 !important;
      }
    `}</style>
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <button
            onClick={handleOpen}
            className="fixed bottom-5 right-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-md transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FeedbackIcon className="h-5 w-5 text-white" />
            <span className="font-medium">Feedback</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
            sideOffset={5}
            style={{ zIndex: 1600 }}
          >
            Submit your feedback or report issues
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Fade in={open}>
          <div className="bg-white p-8 rounded-lg max-w-md mx-auto mt-20 relative">
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <h2 className="text-2xl mb-6 font-semibold">Submit Feedback</h2>
            <form onSubmit={handleSubmit}>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <Select
                    value={feedback.issueType}
                    onChange={(e) => setFeedback({ ...feedback, issueType: e.target.value as string })}
                    fullWidth
                    className="mb-4"
                    style={{ zIndex: 1600 }}
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {selected === 'bug' && <BugReport sx={{ mr: 1 }} />}
                        {selected === 'feature' && <Lightbulb sx={{ mr: 1 }} />}
                        {selected === 'other' && <MoreHoriz sx={{ mr: 1 }} />}
                        {selected.charAt(0).toUpperCase() + selected.slice(1)}
                      </div>
                    )}
                  >
                    <MenuItem value="bug"><BugReport sx={{ mr: 1 }} /> Bug</MenuItem>
                    <MenuItem value="feature"><Lightbulb sx={{ mr: 1 }} /> Feature Request</MenuItem>
                    <MenuItem value="other"><MoreHoriz sx={{ mr: 1 }} /> Other</MenuItem>
                  </Select>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                    sideOffset={5}
                    style={{ zIndex: 1600 }}
                  >
                    Select the type of feedback you&apos;re submitting
                    <Tooltip.Arrow className="fill-white" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <TextField
                multiline
                rows={4}
                value={feedback.description}
                onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
                fullWidth
                className="mb-4"
                placeholder="Describe your issue or suggestion"
                InputProps={{
                  endAdornment: (
                    <Tooltip.Root delayDuration={0}>
                      <Tooltip.Trigger asChild>
                        <InfoIcon color="action" />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                          sideOffset={5}
                          style={{ zIndex: 1600 }}
                        >
                          Provide as much detail as possible
                          <Tooltip.Arrow className="fill-white" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ),
                }}
              />

              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <RadioGroup
                    row
                    value={feedback.severity}
                    onChange={(e) => setFeedback({ ...feedback, severity: e.target.value })}
                    className="mb-4"
                  >
                    <FormControlLabel value="low" control={<Radio />} label="Low" />
                    <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                    <FormControlLabel value="high" control={<Radio />} label="High" />
                  </RadioGroup>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                    sideOffset={5}
                    style={{ zIndex: 1600 }}
                  >
                    How urgent is this feedback?
                    <Tooltip.Arrow className="fill-white" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <TextField
                type="email"
                value={feedback.email}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                fullWidth
                className="mb-4"
                placeholder="Your email"
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <Tooltip.Root delayDuration={0}>
                      <Tooltip.Trigger asChild>
                        <InfoIcon color="action" />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="select-none rounded bg-white px-4 py-2.5 text-sm leading-none shadow-md shadow-black/20"
                          sideOffset={5}
                          style={{ zIndex: 1600 }}
                        >
                          We&apos;ll use this to follow up on your feedback
                          <Tooltip.Arrow className="fill-white" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  ),
                }}
              />

              <div className="mb-4">
                <p className="mb-2 text-sm font-medium flex items-center">
                  <AttachFile sx={{ mr: 1, fontSize: '1rem' }} />
                  Attachments (optional)
                </p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can add screenshots or relevant files to help explain your feedback.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </Fade>
      </Modal>
    </Tooltip.Provider>
    </>
  );
};

export default FeedbackButton;