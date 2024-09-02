
import React, { useState } from 'react';
import { Button, TextField, Container, Grid, Box, Typography } from '@mui/material';

const Calculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleButtonClick = (value: string) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleCalculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(input);
      setResult(evalResult.toString());
    } catch (error) {
      setResult('Error');
    }
  };

  return (
    <Container className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Box className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Typography variant="h4" className="mb-6 text-center text-blue-600">
          Calculator
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          value={input}
          className="mb-4"
          InputProps={{
            readOnly: true,
            className: 'text-right',
          }}
        />
        <TextField
          variant="outlined"
          fullWidth
          value={result}
          className="mb-6"
          InputProps={{
            readOnly: true,
            className: 'text-right',
          }}
        />
        <Grid container spacing={2}>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((value) => (
            <Grid item xs={3} key={value}>
              <Button
                variant="contained"
                fullWidth
                className="h-16 bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => (value === '=' ? handleCalculate() : handleButtonClick(value))}
              >
                {value}
              </Button>
            </Grid>
          ))}
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" fullWidth className="h-16" onClick={handleClear}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Calculator;
