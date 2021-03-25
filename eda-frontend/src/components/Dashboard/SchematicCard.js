import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Typography,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
  Tooltip,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import Modal from '@material-ui/core/Modal';
import ShareIcon from '@material-ui/icons/Share'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'
import DeleteIcon from '@material-ui/icons/Delete'
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import { deleteSchematic } from '../../redux/actions/index'
import MuiAlert from '@material-ui/lab/Alert'
import { useDispatch } from 'react-redux'
import { fetchConfigURL } from '../../redux/actions/index'
import api from '../../utils/Api'


const useStyles = makeStyles((theme) => ({
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  rating: {
    marginTop: theme.spacing(1),
    marginLeft: 'auto'
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

// Schematic delete snackbar
function SimpleSnackbar({ open, close, sch }) {
  const dispatch = useDispatch()

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open={open}
      autoHideDuration={6000}
      onClose={close}
    >
      <Alert icon={false} severity="warning" color="error" style={{ width: '100%' }} action={
        <>
          <Button size="small" aria-label="close" color="inherit" onClick={() => { dispatch(deleteSchematic(sch.save_id)) }}>
            Yes
          </Button>
          <Button size="small" aria-label="close" color="inherit" onClick={close}>
            NO
          </Button>
        </>
      }
      >
        {'Delete ' + sch.name + ' ?'}
      </Alert>
    </Snackbar>
  )
}

SimpleSnackbar.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  sch: PropTypes.object
}

// Display schematic updated status (e.g : updated 2 hours ago...)
function timeSince(jsonDate) {
  var json = jsonDate

  var date = new Date(json)

  var seconds = Math.floor((new Date() - date) / 1000)

  var interval = Math.floor(seconds / 31536000)

  if (interval > 1) {
    return interval + ' years'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + ' months'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + ' days'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + ' hours'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + ' minutes'
  }
  return Math.floor(seconds) + ' seconds'
}

// Display schematic created date (e.g : Created On 29 Jun 2020)
function getDate(jsonDate) {
  var json = jsonDate
  var date = new Date(json)
  const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' })
  const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date)
  return `${day}-${month}-${year}`
}


// Card displaying overview of onCloud saved schematic.
export default function SchematicCard({ sch }) {
  const classes = useStyles()
  const dispatch = useDispatch()

  // To handle secret key for LTI usage
  const [secretKey, setSecretKey] = React.useState("")

  // To handle
  const [consumerKey, setConsumerKey] = React.useState("")

  // To handle consumer key for LTI usage
  const [configURL, setConfigURL] = React.useState()
  // To handle delete schematic snackbar
  const [snacOpen, setSnacOpen] = React.useState(false)

  //To handle sharing of circuit as a LTI producer
  const [ltiModal, setLTIModal] = React.useState(false)

  const handleSnacClick = () => {
    setSnacOpen(true)
  }
  // Api call for getting LTI config url for specified circuit by passing consumer key and secret key
  const handleLTIGenerate = (consumer_key, secret_key, save_id) => {
    console.log(consumer_key, secret_key)
    const body = {
      "consumer_key": consumer_key,
      "secret_key": secret_key,
      "save_id": save_id,
    }
    var response = api.post(`lti/create/`, body)
      .then(res => {
        setConfigURL(res.data.config_url)
        return res.data
      })
      .catch((err) => { console.error(err) })
  }
  const handleOpenLTI = () => {
    //To-do write a get request to check if it params are already set
    setLTIModal(true)
    
    // if(response.data.secret_key){
    //   setSecretKey(response.data.secret_key)
    //   setConsumerKey(response.data.consumer_key)
    //   setConfigURL(response.data.configURL)
    // }
  }

  const handleCloseLTI = () => {
    setLTIModal(false)
  }

  const handleConsumerKey = (e) => {
    console.log(e.target.value);
    setConsumerKey(e.target.value)
  }

  const handleSecretKey = (e) => {
    console.log(e.target.value)
    setSecretKey(e.target.value)
  }

  const handleSnacClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnacOpen(false)
  }

  return (
    <>
      {/* User saved Schematic Overview Card */}
      <Card>
        <CardActionArea>
          <CardHeader
            title={sch.name}
            subheader={'Created On ' + getDate(sch.create_time)} /* Display created date */
          />
          <CardMedia
            className={classes.media}
            image={sch.base64_image}
            title={sch.name}
          />
          <CardContent>
            <Typography variant="body2" component="p">
              {sch.description}
            </Typography>
            {/* Display updated status */}
            <Typography variant="body2" color="textSecondary" component="p" style={{ margin: '5px 0px 0px 0px' }}>
              Updated {timeSince(sch.save_time)} ago...
            </Typography>
          </CardContent>
        </CardActionArea>

        <CardActions>
          <Button
            target="_blank"
            component={RouterLink}
            to={'/editor?id=' + sch.save_id}
            size="small"
            color="primary"
          >
            Launch in Editor
          </Button>
          <Tooltip title='Share to LMS' placement="bottom" arrow>
            <ScreenShareIcon
              color='secondary'
              fontSize="small"
              style={{ marginLeft: 'auto' }}
              onClick={() => { handleOpenLTI() }}
            />
          </Tooltip>
          <Dialog onClose={handleCloseLTI} aria-labelledby="simple-dialog-title" open={ltiModal}>
            <DialogTitle id="simple-dialog-title">Share circuit to LMS</DialogTitle>
            <DialogContent>
              <TextField id="standard-basic" label="Consumer Key" defaultValue={consumerKey} onChange={handleConsumerKey} />
              <TextField style={{ marginLeft: '10px' }} id="standard-basic" label="Secret Key" defaultValue={secretKey} onChange={handleSecretKey} />
              <h3>{configURL}</h3>
              <Button style={{ marginTop: '25px', marginBottom: '10px' }} variant="contained" color="primary" onClick={() => handleLTIGenerate(consumerKey, secretKey, sch.save_id)}>
                Generate LTI config URL
              </Button>
            </DialogContent>
          </Dialog>
          {/* Display delete option */}
          <Tooltip title='Delete' placement="bottom" arrow>
            <DeleteIcon
              color='secondary'
              fontSize="small"
              onClick={() => { handleSnacClick() }}
            />
          </Tooltip>
          <SimpleSnackbar open={snacOpen} close={handleSnacClose} sch={sch} />

          {/* Display share status */}
          <Tooltip title={!sch.shared ? 'SHARE OFF' : 'SHARE ON'} placement="bottom" arrow>
            <ShareIcon
              color={!sch.shared ? 'disabled' : 'primary'}
              fontSize="small"
              style={{ marginRight: '10px' }}
            />
          </Tooltip>
        </CardActions>
      </Card>
    </>
  )
}

SchematicCard.propTypes = {
  sch: PropTypes.object
}
