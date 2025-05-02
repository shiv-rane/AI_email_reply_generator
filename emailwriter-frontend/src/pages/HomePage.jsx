import { useState } from "react";
import Swal from 'sweetalert2';
import {
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Select,
  Typography,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // 👈 Import useNavigate

const theme = createTheme({
  palette: {
    primary: { main: "#007BFF" },
    secondary: { main: "#FF5722" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h3: { fontWeight: "bold" },
  },
});

function HomePage() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();  // 👈 Initialize useNavigate

  const handleLogout = () => {
    localStorage.removeItem("token");  // Remove token from localStorage
    navigate("/login");  // Redirect to login page
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
        const token = localStorage.getItem("token");  // Retrieve the token from localStorage

        const response = await axios.post(
          "http://localhost:8080/api/email/generate",
          { emailContent, tone },
          { 
              headers: { 
                  Authorization: `Bearer ${token}`  // ✅ Corrected template literals
              }
          }
      );

        setGeneratedReply(response.data.reply);
    } catch (error) {
        if (error.response && error.response.status === 403) {
          Swal.fire({
            title: 'Upgrade Required',
            text: error.response.data.error,
            icon: 'warning',
            confirmButtonText: 'Upgrade Now'
        }).then((result) => {
            if (result.isConfirmed) {
                // Add a slight delay before navigating
                setTimeout(() => {
                    navigate("/payment");
                }, 300);  // Adjust delay as needed
            }
        })
        } else {
            setError("Failed to generate email reply. Please try again");
        }
        console.error(error);
    } finally {
        setLoading(false);
    }
};



  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" color="primary">
            AI Email Reply Generator
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" color="primary" gutterBottom>
            AI Email Reply Generator
          </Typography>
        </motion.div>

        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              label="Original Email Content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tone (Optional)</InputLabel>
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!emailContent || loading}
              sx={{ py: 1.5, fontSize: "1rem" }}
            >
              {loading ? <CircularProgress size={24} /> : "Generate Reply"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {generatedReply && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card variant="outlined" sx={{ mt: 3, p: 3, boxShadow: 2, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generated Reply:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={generatedReply}
                inputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={() => navigator.clipboard.writeText(generatedReply)}
              >
                Copy to Clipboard
              </Button>
            </Card>
          </motion.div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default HomePage;