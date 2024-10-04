import { useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
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
  Person,
  Upload,
} from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";
import Wave from "./wave";
import { AudioRecorder } from "react-audio-voice-recorder";
import "./App.css";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { darkTheme, lightTheme } from "./theme";
import LoadingSpinnerScreen from "./LoadingSpinnerScreen";

export default function App() {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setfileName] = useState("Audio File Name");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("dark"); // Manage theme mode
  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const handleThemeToggle = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

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
      setAudioBlob(file);
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
    setAudioBlob(blob);
  };

  const testGetFromServer = async () => {
    fetch("")
      .then((response) => {
        if (response.ok) {
          return response.json(); // Read and parse the JSON body
        }
        throw new Error("Network response was not ok.");
      })
      .then((data) => {
        console.log(data.message); // Access the "message" key in the returned JSON
      })
      .catch((error) =>
        console.error("There was a problem with the fetch operation:", error)
      );
  };

  const getTranscriptions = async (blob: Blob) => {
    if (!blob) {
      console.error("No audio blob available for transcription.");
      return;
    }

    // Create a new FormData object
    const formData = new FormData();
    formData.append("file", blob, fileName); // Append the blob with the filename

    try {
      const response = await fetch(
        "http://10.104.143.81:5000/create-transcription",
        {
          method: "POST",
          body: formData, // Send FormData instead of raw Blob
          // No need to manually set Content-Type; fetch will automatically add proper multipart headers
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json(); // Parse the JSON response
      console.log(data.message); // Access the "message" key in the returned JSON
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleSD = async () => {
    if (audioBlob) {
      console.log("start SD");
      console.log(audioBlob.type);

      await getTranscriptions(audioBlob);
    }
  };

  const summary = `Overall Summary of Conversation:
During the consultation, Dr. Ahmed addressed the concerns of a patient regarding her mother's significant weight loss, persistent abdominal pain, nocturnal diarrhea, and recent jaundice. Dr. Ahmed suggested that these symptoms could indicate several conditions, including cholestasis or pancreatic issues. He recommended conducting an abdominal ultrasound, liver function tests, and checking the C-A19-9 tumor marker to rule out pancreatic cancer or biliary diseases. Additionally, he mentioned the possibility of an MRCP (Magnetic Resonance Cholangiopancreatography) for a detailed view of the bile ducts and pancreas if necessary. The family expressed their willingness to proceed with the tests.

Action Items:
1. Schedule an abdominal ultrasound.
2. Conduct liver function tests, including albumin and bilirubin levels.
3. Check C-A19-9 levels.
4. Consider an MRCP if initial tests indicate further investigation is needed.
5. Monitor the patient's symptoms, particularly abdominal pain after meals and any changes in jaundice or pruritus.`;

  return (
    <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <Box
        bgcolor="background.default"
        sx={{ minHeight: "100vh", padding: "15px" }}
      >
        {/* Header */}
        <AppBar
          position="static"
          sx={(theme) => ({
            bgcolor: theme.palette.primary.main,
            mb: "3px",
            borderRadius: "12px",
          })}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" sx={{ mr: 2 }} color="text.primary">
                Doctor's Appointment
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={(theme) => ({
                  padding: "0.75px",
                  my: 1,
                  mx: 1,
                  bgcolor: theme.palette.background.default,
                })}
              />
              <Box
                bgcolor="secondary.main"
                sx={{
                  borderRadius: 3,
                  marginLeft: 2,
                }}
              >
                <IconButton sx={{ color: "text.secondary" }}>
                  <Event />
                  <Typography variant="body2" sx={{ marginLeft: 1 }}>
                    16 Aug 2024
                  </Typography>
                </IconButton>
              </Box>
              <Box
                bgcolor="secondary.main"
                sx={{
                  borderRadius: 3,
                  marginLeft: 1,
                }}
              >
                <IconButton sx={{ color: "text.secondary" }}>
                  <AccessTime />
                  <Typography variant="body2" sx={{ marginLeft: 1 }}>
                    1 pm - 2 pm
                  </Typography>
                </IconButton>
              </Box>
              <Box
                bgcolor="secondary.main"
                sx={{
                  borderRadius: 3,
                  marginLeft: 1,
                }}
              >
                <IconButton sx={{ color: "text.secondary" }}>
                  <Person />
                  <Typography variant="body2" sx={{ marginLeft: 1 }}>
                    Jane Doe
                  </Typography>
                </IconButton>
              </Box>
            </Box>
            <IconButton onClick={handleThemeToggle} sx={{ marginLeft: "auto" }}>
              {mode === "light" ? (
                <DarkModeIcon sx={{ color: "primary.dark" }} />
              ) : (
                <LightModeIcon sx={{ color: "primary.light" }} />
              )}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box display="flex" gap="3px" height="calc(100vh - 64px - 40px)">
          {/* Left Side: Audio and Transcription */}
          <Box flex={1} display={"flex"} flexDirection={"column"}>
            {/* Audio File Section */}
            <Card
              sx={{
                bgcolor: "primary.main",
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
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  color="text.primary"
                >
                  <FilePresentRounded />
                  <Typography variant="h6" noWrap maxWidth={"295px"}>
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
                      backgroundColor: "secondary.main",
                      mr: 1,
                      color: "text.secondary",
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
                waveColor={mode === "light" ? "lightblue" : "white"}
                url="src/audio/ukfinf_noi_fem_mix_9_full.wav"
                onReady={onReady}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                <Button
                  onClick={onPlayPause}
                  sx={{
                    backgroundColor: "text.secondary",
                    color: "primary.secondary",
                    borderRadius: 2,
                  }}
                >
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleSD}
                  sx={{
                    backgroundColor: "text.secondary",
                    color: "primary.secondary",
                    borderRadius: 2,
                  }}
                >
                  SPEAKER DIARIZATION!
                </Button>
              </Box>
            </Card>

            {/* Transcription Section */}
            <Card
              sx={{
                bgcolor: "primary.main",
                padding: 2,
                borderRadius: 3,
                flex: 1,
                overflow: "auto",
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <MessageRounded />
                <Typography variant="h5">Transcription</Typography>
              </Box>
              <Divider
                flexItem
                sx={{ padding: "0.25px", my: 2, bgcolor: "primary.dark" }}
              />
              {/* List of dialogues */}
              {isLoading ? (
                <LoadingSpinnerScreen />
              ) : isError ? (
                <div>Error during speaker diarization process</div>
              ) : (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ mr: 2, color: "text.primary" }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.primary">
                        Doctor Joe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    flexItem
                    sx={{ padding: "0.2px", my: 2, bgcolor: "primary.dark" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ mr: 2, color: "text.primary" }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.primary">
                        Doctor Joe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    flexItem
                    sx={{ padding: "0.2px", my: 2, bgcolor: "primary.dark" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ mr: 2, color: "text.primary" }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.primary">
                        Doctor Joe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    flexItem
                    sx={{ padding: "0.2px", my: 2, bgcolor: "primary.dark" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Person sx={{ mr: 2, color: "text.primary" }} />
                    <Box>
                      <Typography variant="subtitle1" color="text.primary">
                        Doctor Joe
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        00:00 - Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit
                        amet.
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    flexItem
                    sx={{ padding: "0.2px", my: 2, bgcolor: "primary.dark" }}
                  />
                  {/* Add more dialogues as necessary */}
                </Box>
              )}
            </Card>
          </Box>
          {/* Right Side: Summary Section */}
          <Card
            sx={{
              bgcolor: "primary.main",
              padding: 2,
              borderRadius: 3,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              color={"text.secondary"}
            >
              <BookRounded />
              <Typography variant="h5">Summary</Typography>
            </Box>
            <Divider
              flexItem
              sx={{ padding: "0.25px", my: 2, bgcolor: "primary.dark" }}
            />
            <Typography
              color="text.secondary"
              sx={{
                whiteSpace: "pre-line",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
            >
              {isLoading ? (
                <LoadingSpinnerScreen />
              ) : isError ? (
                <div>Error during speaker diarization process</div>
              ) : (
                summary
              )}
              {/* Add more summary details */}
            </Typography>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
