import React, { useState, useEffect } from 'react';
import GetBatchDetails from "./GetBatches";
import SimpleModal from '../Common/Modal';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Axios from 'axios';
import AssociateList from './AssociateList/AssociateList';
import { useSelector } from 'react-redux';
import Progress from './BatchProgress/progress'
import { Card, CardContent, CardHeader } from '@material-ui/core';

function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [batchToShow, setBatchToShow] = useState({});
  
  const token = useSelector((state) => state.credReducer.token);
  const batch = useSelector(state => state.batchReducer);
  const userId = useSelector(state => state.credReducer.userObject.userId);

  //TODO: Get request for batch information and setBatch
  useEffect(() => {
    Axios.get("http://ec2-18-232-171-89.compute-1.amazonaws.com:8081/UB/batchesbyuser", {
      params: {
        userId: userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setBatches(result.data);
      })
      .catch((err) => console.log("error batch:" + err));
    
    setBatchToShow(batch);
  }, [batch, userId]);

  return (
    <div style={{ padding: "5em" }}>
      <Grid container spacing={3}>
        <Grid item sm={3}>
          <Card>
            <CardHeader style={{ backgroundColor: "#474C55", color: "#FFF" }} title="Batches Available" />
            <CardContent>
              <GetBatchDetails batches={batches}/>
            </CardContent>
          </Card>
        </Grid>
        <Grid item sm={9}>
          <Progress batches={batches}/>
          <SimpleModal />
          <br />
          <AssociateList batch={batchToShow} />
        </Grid>
      </Grid>
    </div>
  );
}

export default BatchPage;
