import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  CssBaseline,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  useTheme,
} from "@mui/material";
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
  LocalHospital,
} from "@mui/icons-material";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import Hover from "wavesurfer.js/dist/plugins/hover";
import Wave from "./wave";
import { AudioRecorder } from "react-audio-voice-recorder";
import "./App.css";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { darkTheme, lightTheme } from "./theme";
import LoadingSpinnerScreen from "./LoadingSpinnerScreen";
import { WaveFile } from "wavefile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import ReactPDF, { PDFDownloadLink } from "@react-pdf/renderer";
import { PDFFile } from "./Transcription";

export type Transcriptions = {
  speaker: string;
  timestamp: [number, number];
  transcription: string;
};

export default function App() {
  const [personName, setPersonName] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("00:00"); // Default time
  const [open, setOpen] = useState(false); // State to control the dropdown
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs()); // Initialize with the current date

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setfileName] = useState("Audio File Name");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("dark"); // Manage theme mode
  const [audioBlob, setAudioBlob] = useState<Blob>();
  const [transcriptions, setTranscriptions] = useState<
    Transcriptions[] | null
  >();
  const [summary, setSummary] = useState<string>(
    "Upload or record an audio :)"
  );
  const [isTLoading, setIsTLoading] = useState<boolean>(false);
  const [isTError, setIsTError] = useState<boolean>(false);
  const [isSLoading, setIsSLoading] = useState<boolean>(false);
  const [isSError, setIsSError] = useState<boolean>(false);

  const handleThemeToggle = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  useEffect(() => {
    wavesurfer?.registerPlugin(
      TimelinePlugin.create({
        primaryLabelInterval: 0,
        secondaryLabelInterval: 1,
      })
    );
    wavesurfer?.registerPlugin(
      Hover.create({
        lineWidth: 1,
        labelSize: "12px",
      })
    );
    updateRemoveButton();
  }, [wavesurfer]);

  const updateRemoveButton = () => {
    const imgElement = document.querySelector(
      ".custom-discard-class"
    ) as HTMLImageElement;
    if (imgElement) {
      imgElement.src = "src/image/cross.webp"; // Clear the original image source
    }
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && wavesurfer) {
      const objectURL = URL.createObjectURL(file);
      wavesurfer.load(objectURL); // Load the uploaded audio file into wavesurfer
      setfileName(file.name);

      if (!file.type.includes("wav")) {
        setAudioBlob(await convertBlobToWav(file));
      } else {
        setAudioBlob(file);
      }
    }
  };

  // Trigger file input when the button is clicked
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const convertBlobToWav = async (blob: Blob) => {
    const audioContext = new AudioContext();

    // Decode the MP4 blob into raw audio data
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Extract audio channel data
    const channelData = audioBuffer.getChannelData(0); // Use the first audio channel

    // Step 3: Create a new WaveFile instance and configure it with the audio data
    const wav = new WaveFile();

    // Create the WAV file from the audio buffer's channel data
    wav.fromScratch(1, audioBuffer.sampleRate, "32f", channelData);

    // Convert to WAV format and create a Blob
    const wavBlob = new Blob([wav.toBuffer()], { type: "audio/wav" });

    return wavBlob;
  };

  const addAudioElement = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    wavesurfer?.load(url);
    const wavBlob = await convertBlobToWav(blob); // Convert MP4 to WAV
    setfileName("New_recorded_audio");
    setAudioBlob(wavBlob);
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

    setIsSLoading(true);
    setIsTLoading(true);
    try {
      const uploadAudioResponse = await fetch(
        "http://10.104.143.81:5000/upload-audio",
        {
          method: "POST",
          body: formData, // Send FormData instead of raw Blob
          // No need to manually set Content-Type; fetch will automatically add proper multipart headers
        }
      );

      if (!uploadAudioResponse.ok) {
        throw new Error("Network response was not ok.");
      }

      const audio_file_path = await uploadAudioResponse.json();
      console.log(audio_file_path["file_path"]);

      const asr_sd_response = await fetch(
        "http://10.104.143.81:5000/create-asr-sd",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_file_path: audio_file_path,
          }), // Send as JSON
        }
      );

      if (asr_sd_response.status !== 200) {
        throw new Error("Network response was not ok.");
      }

      const asr_sd = await asr_sd_response.json();
      console.log(asr_sd);

      const transcription_response = await fetch(
        "http://10.104.143.81:5000/create-transcription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ asr_sd, duration: wavesurfer?.getDuration() }), // Send as JSON
        }
      );

      if (transcription_response.status !== 200) {
        throw new Error("Network response was not ok.");
      }

      const transcription = await transcription_response.json();
      setTranscriptions(transcription);
      setIsTLoading(false);
      setIsTError(false);
      console.log(transcription);

      try {
        const summary_response = await fetch(
          "http://10.104.143.81:5000/create-summary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcription }), // Send as JSON
          }
        );

        if (summary_response.status !== 200) {
          throw new Error("Network response was not ok.");
        }

        const summary = await summary_response.json();
        setSummary(summary.replace(/\*/g, ""));
        setIsSLoading(false);
        setIsSError(false);
        console.log(summary);
      } catch (error) {
        setIsSLoading(false);
        setIsSError(true);
        console.error(
          "There was a problem with the fetch operation for summary:",
          error
        );
      }
    } catch (error) {
      setIsTLoading(false);
      setIsSLoading(false);
      setIsTError(true);
      console.error(
        "There was a problem with the fetch operation for asr/sd:",
        error
      );
    }
  };

  const handleSD = async () => {
    if (!wavesurfer) {
      toast("Please upload audio file or record an audio conversation");
    } else if (wavesurfer.getDuration() < 30) {
      toast("Please ensure audio is more than 30 seconds long");
    } else if (wavesurfer.getDuration() > 360) {
      toast("Please ensure audio is less than 6 minutes long");
    } else if (audioBlob) {
      console.log(audioBlob.type);
      toast("Starting speaker diarization process, please wait :)");
      await getTranscriptions(audioBlob);
    } else {
      toast(
        "Current audio is a placeholder, please upload an audio file or record an audio conversation"
      );
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const minutes = Math.floor(timestamp / 60); // Get whole minutes
    const seconds = Math.floor(timestamp % 60); // Get remaining seconds
    const formattedMinutes = String(minutes).padStart(2, "0"); // Pad minutes
    const formattedSeconds = String(seconds).padStart(2, "0"); // Pad seconds
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Generate time segments from 00:00 to 23:00 in 1-hour increments
  const timeSegments = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const handleTimeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTime(event.target.value);
  };

  const handleIconClick = () => {
    setOpen((prev) => !prev); // Toggle the dropdown state
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue); // Update state with the new date
  };

  const handleDLPDF = () => {
    if (!personName.length || selectedTime === "00:00") {
      toast("Name or Time might be unchanged");
    }
  };

  const handleDLAudio = () => {
    if (!audioBlob) {
      console.error("No audio file available for download.");
      return;
    }

    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);

    const sanitizedFileName = fileName
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .split(".")[0]; // Remove existing extension

    // Create an anchor element
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = sanitizedFileName + "_" + selectedTime + ".wav"; // Filename for the downloaded file

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(audioUrl);
  };

  return (
    <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <ToastContainer />
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
                SmartScribe
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
                  height: "40px",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    slotProps={{
                      yearButton: {
                        sx: {
                          "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus":
                            {
                              backgroundColor: "lightblue !important", // Custom background for selected year
                              color: "black !important", // Ensure text contrast
                            },
                        },
                      },
                      day: {
                        sx: {
                          "&.Mui-selected": {
                            backgroundColor: "lightblue !important", // Set background color for selected day
                            color: "black",
                            "&:hover": {
                              backgroundColor: "lightblue", // Set hover color for selected day
                            },
                          },
                        },
                      },
                      layout: {
                        sx: {
                          backgroundColor: "secondary.main",
                          borderRadius: 3,
                        },
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            backgroundColor: "secondary.main", // Set your custom background color here
                            borderRadius: 3, // Add border-radius if desired
                            boxShadow: "none", // Remove any default shadow
                            color: "text.primary", // Set text color if needed
                            marginTop: 0.5,
                          },
                        },
                      },
                      textField: {
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            border: "none", // Remove border
                            height: "40px", // Set height
                            width: "320px",
                            "&:hover": {
                              backgroundColor: "transparent", // Disable hover effect
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none", // Remove outline border
                          },
                          "& .MuiSvgIcon-root": {
                            color: "text.secondary", // Change the color of the calendar icon
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
              <Box
                bgcolor="secondary.main"
                sx={{
                  borderRadius: 3,
                  marginLeft: 1,
                }}
              >
                <FormControl
                  variant="standard"
                  sx={{
                    minWidth: "120px",
                    height: "40px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    <AccessTime
                      sx={{ marginRight: 1, cursor: "pointer" }}
                      onClick={handleIconClick}
                    />
                    <Select
                      value={selectedTime}
                      onChange={handleTimeChange}
                      open={open} // Control the open state
                      onOpen={() => setOpen(true)} // Set to true when the dropdown opens
                      onClose={() => setOpen(false)}
                      sx={{
                        width: "70px",
                        marginTop: "5px",
                        "&:before, &:after": {
                          display: "none", // Hide the underline on focus and hover
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: "secondary.main",
                            padding: 0, // Remove padding from the Paper component
                            marginTop: 1, // Remove margin to eliminate white space
                            marginRight: "50px",
                            width: "90px",
                            borderRadius: 3,
                          },
                        },
                        MenuListProps: {
                          sx: {
                            padding: 0, // Remove padding from the MenuList to eliminate excess space
                            margin: 0,
                            height: "335px",
                          },
                        },
                      }}
                    >
                      {timeSegments.map((time) => (
                        <MenuItem
                          key={time}
                          value={time}
                          sx={{
                            backgroundColor: "secondary.main", // Change background color
                            color: "seconday.main", // Change text color
                            justifyContent: "center", // Center the items in the dropdown
                            "&:hover": {
                              backgroundColor: "secondary.main", // Change background color on hover
                            },
                            "&.Mui-selected": {
                              backgroundColor: "lightblue !important", // Change background color when selected
                              color: "black",
                              "&:hover": {
                                backgroundColor: "lightblue !important", // Change background color on hover
                                color: "seconday.main !important",
                              },
                            },
                          }}
                        >
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </FormControl>
              </Box>
              <Box
                bgcolor="secondary.main"
                sx={{
                  borderRadius: 3,
                  marginLeft: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IconButton sx={{ color: "text.secondary" }}>
                  <Person />
                </IconButton>

                <TextField
                  variant="standard"
                  placeholder="Enter Name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  sx={{
                    marginLeft: 1,
                  }}
                  InputProps={{ disableUnderline: true }}
                />
              </Box>
            </Box>

            <Box marginLeft={"auto"}>
              {transcriptions ? (
                transcriptions && (
                  <PDFDownloadLink
                    document={
                      <PDFFile
                        summary={summary}
                        transcriptions={transcriptions}
                        selectedDate={selectedDate}
                        personName={personName}
                        selectedTime={selectedTime}
                      />
                    }
                    fileName={fileName + ".pdf"}
                  >
                    {/* github.com/diegomura/react-pdf/pull/2888/files */}
                    {({ loading }) =>
                      loading ? (
                        <Button
                          sx={{
                            backgroundColor: "lightblue",
                            color: "black",
                            borderRadius: 2,
                          }}
                        >
                          Loading PDF...
                        </Button>
                      ) : (
                        <Button
                          onClick={handleDLPDF}
                          sx={{
                            backgroundColor: "lightblue",
                            color: "black",
                            borderRadius: 2,
                          }}
                        >
                          Download PDF
                        </Button>
                      )
                    }
                  </PDFDownloadLink>
                )
              ) : (
                <Button
                  disabled={true}
                  sx={{
                    backgroundColor: "lightblue",
                    color: "black",
                    borderRadius: 2,
                  }}
                >
                  Download PDF
                </Button>
              )}
            </Box>
            <Button
              onClick={handleDLAudio}
              disabled={!audioBlob}
              sx={{
                backgroundColor: "lightblue",
                color: "black",
                borderRadius: 2,
                marginLeft: "10px",
              }}
            >
              Download Audio
            </Button>
            <IconButton onClick={handleThemeToggle} sx={{ marginLeft: "10px" }}>
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
                    downloadOnSavePress={false}
                    downloadFileExtension="wav"
                    showVisualizer={true}
                    classes={{
                      AudioRecorderDiscardClass: "custom-discard-class",
                    }}
                  />
                </Box>
              </Box>
              {/* Placeholder for the waveform visual */}
              <Wave
                height={70}
                waveColor={"lightblue"}
                url="src/audio/ukfinf_noi_fem_mix_9_full.wav"
                onReady={onReady}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  marginTop: 3,
                }}
              >
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
                  Transcribe/Summarise
                </Button>
              </Box>
            </Card>
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

              {isSLoading ? (
                <LoadingSpinnerScreen />
              ) : isSError ? (
                <Typography color="error">
                  Error during summary process
                </Typography>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-line",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                >
                  {summary}
                </Typography>
              )}
            </Card>
          </Box>
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
            {isTLoading ? (
              <LoadingSpinnerScreen />
            ) : isTError ? (
              <Typography color="error">
                Error during speaker diarization process
              </Typography>
            ) : (
              transcriptions &&
              transcriptions.map((transcription, index) => (
                <Box key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    {transcription.speaker === "Doctor" ? (
                      <LocalHospital sx={{ mr: 2, color: "text.primary" }} />
                    ) : (
                      <Person sx={{ mr: 2, color: "text.primary" }} />
                    )}
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center" }}
                        gap={1}
                      >
                        <Typography variant="subtitle1" color="text.primary">
                          {transcription.speaker}
                        </Typography>
                        <Typography variant="subtitle1" color="text.primary">
                          ~
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{ textAlign: "end" }}
                        >
                          {formatTimestamp(transcription.timestamp[0])} -{" "}
                          {formatTimestamp(transcription.timestamp[1])}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {transcription.transcription}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    flexItem
                    sx={{ padding: "0.2px", my: 2, bgcolor: "primary.dark" }}
                  />
                </Box>
              ))
            )}
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
