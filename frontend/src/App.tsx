import { useRef, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import WavesurferPlayer from "@wavesurfer/react";
import {
  AppBar,
  Button,
  Card,
  Divider,
  IconButton,
  Toolbar,
} from "@mui/material";
import {
  AccessTime,
  BookRounded,
  Event,
  FilePresentRounded,
  MessageRounded,
  Mic,
  Person,
  Upload,
} from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";
import Wave from "./wave";
import { AudioRecorder } from "react-audio-voice-recorder";
import "./App.css";
import { mockSummary } from "./mock";

export default function App() {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setfileName] = useState("Audio File Name");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && wavesurfer) {
      const objectURL = URL.createObjectURL(file);
      wavesurfer.load(objectURL); // Load the uploaded audio file into wavesurfer
      setfileName(file.name);
    }
  };

  // Trigger file input when the button is clicked
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const addAudioElement = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    wavesurfer?.load(url);
    setfileName("New recorded audio");
  };

  return (
    <Box
      sx={{
        bgcolor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "15px",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        sx={{ bgcolor: "#1B1B1B", mb: "3px", borderRadius: "12px" }}
      >
        <Toolbar>
          <Typography variant="h5" sx={{ mr: 2 }}>
            Doctor's Appointment
          </Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ padding: "0.75px", my: 1, mx: 1, bgcolor: "#000" }}
          />
          <Box sx={{ background: "#353535", borderRadius: 3, marginLeft: 2 }}>
            <IconButton color="inherit">
              <Event />
              <Typography
                variant="body2"
                sx={{ marginLeft: 1, color: "#DADADA" }}
              >
                16 Aug 2024
              </Typography>
            </IconButton>
          </Box>
          <Box sx={{ background: "#353535", borderRadius: 3, marginLeft: 1 }}>
            <IconButton color="inherit">
              <AccessTime />
              <Typography
                variant="body2"
                sx={{ marginLeft: 1, color: "#DADADA" }}
              >
                1 pm - 2 pm
              </Typography>
            </IconButton>
          </Box>
          <Box sx={{ background: "#353535", borderRadius: 3, marginLeft: 1 }}>
            <IconButton color="inherit">
              <Person />
              <Typography
                variant="body2"
                sx={{ marginLeft: 1, color: "#DADADA" }}
              >
                Jane Doe
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box display="flex" gap="3px" height="calc(100vh - 64px - 40px)">
        {/* Left Side: Audio and Transcription */}
        <Box flex={1} display={"flex"} flexDirection={"column"}>
          {/* Audio File Section */}
          <Card
            sx={{
              bgcolor: "#1B1B1B",
              padding: 2,
              mb: "3px",
              borderRadius: "12px",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <FilePresentRounded sx={{ color: "#DADADA" }} />
                <Typography
                  variant="h6"
                  color="#DADADA"
                  noWrap
                  maxWidth={"295px"}
                >
                  {fileName}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  startIcon={<Upload />}
                  onClick={handleClick}
                  variant="contained"
                  sx={{
                    backgroundColor: "#353535",
                    mr: 1,
                    color: "#DADADA",
                    borderRadius: 2,
                  }}
                >
                  Upload
                  <input
                    type="file"
                    accept="audio/*"
                    ref={inputRef}
                    onChange={onFileUpload}
                    style={{ display: "none" }}
                  />
                </Button>
                <AudioRecorder
                  onRecordingComplete={addAudioElement}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                  }}
                  onNotAllowedOrFound={(err) => console.table(err)}
                  mediaRecorderOptions={{
                    audioBitsPerSecond: 128000,
                  }}
                  downloadOnSavePress={true}
                  downloadFileExtension="wav"
                  showVisualizer={true}
                />
              </Box>
            </Box>
            {/* Placeholder for the waveform visual */}
            <Wave
              height={200}
              waveColor="white"
              url="src/audio/ukfinf_noi_fem_mix_9_full.wav"
              onReady={onReady}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={onPlayPause}
                sx={{
                  backgroundColor: "#fff",
                  color: "#000",
                  borderRadius: 2,
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </Box>
          </Card>

          {/* Transcription Section */}
          <Card
            sx={{
              bgcolor: "#1B1B1B",
              padding: 2,
              borderRadius: 3,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <MessageRounded sx={{ color: "#DADADA" }} />
              <Typography variant="h5" color="#DADADA">
                Transcription
              </Typography>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.25px", my: 2, bgcolor: "#000" }}
            />
            {/* List of dialogues */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, color: "white" }} />
              <Box>
                <Typography variant="subtitle1" color="#DADADA">
                  Doctor Joe
                </Typography>
                <Typography variant="body2" color="#DADADA">
                  00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.
                </Typography>
              </Box>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.2px", my: 2, bgcolor: "#000" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, color: "white" }} />
              <Box>
                <Typography variant="subtitle1" color="#DADADA">
                  Doctor Joe
                </Typography>
                <Typography variant="body2" color="#DADADA">
                  00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.
                </Typography>
              </Box>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.2px", my: 2, bgcolor: "#000" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, color: "white" }} />
              <Box>
                <Typography variant="subtitle1" color="#DADADA">
                  Doctor Joe
                </Typography>
                <Typography variant="body2" color="#DADADA">
                  00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.
                </Typography>
              </Box>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.2px", my: 2, bgcolor: "#000" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, color: "white" }} />
              <Box>
                <Typography variant="subtitle1" color="#DADADA">
                  Doctor Joe
                </Typography>
                <Typography variant="body2" color="#DADADA">
                  00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.
                </Typography>
              </Box>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.2px", my: 2, bgcolor: "#000" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, color: "white" }} />
              <Box>
                <Typography variant="subtitle1" color="#DADADA">
                  Doctor Joe
                </Typography>
                <Typography variant="body2" color="#DADADA">
                  00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                  amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.
                </Typography>
              </Box>
            </Box>
            {/* Add more dialogues as necessary */}
          </Card>
        </Box>
        {/* Right Side: Summary Section */}
        <Card
          sx={{
            bgcolor: "#1B1B1B",
            padding: 2,
            borderRadius: 3,
            flex: 1,
            overflow: "auto",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <BookRounded sx={{ color: "#DADADA" }} />
            <Typography variant="h5" color="#DADADA">
              Summary
            </Typography>
          </Box>
          <Divider
            flexItem
            sx={{ padding: "0.25px", my: 2, bgcolor: "#000" }}
          />
          <Typography
            color="#DADADA"
            sx={{
              whiteSpace: "pre-line",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            {mockSummary}
            {/* Add more summary details */}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
