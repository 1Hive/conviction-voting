import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import {
  Main,
  Button,
  SidePanel,
  Box,
  DataView,
  useTheme,
  Text,
  Badge,
} from '@aragon/ui'
import styled from 'styled-components'
import AppHeader from './components/AppHeader'
import SummaryBar from './components/SummaryBar'
import Balances from './components/Balances'
import BalanceToken from './components/BalanceToken'
import ProposalDetail from './components/ProposalDetail'
import AddProposalPanel from './components/AddProposalPanel'

function App() {
  const { api, appState } = useAragonApi()
  const { proposals, convictionStakes } = appState
  const you = '0xD41b2558691d4A39447b735C23E6c98dF6cF4409' // TODO get from accounts
  const myStake =
    convictionStakes &&
    convictionStakes
      .filter(({ entity }) => entity === you)
      .reduce((last, current) => (last.time > current.time ? last : current))

  const theme = useTheme()
  const balances = [
    {
      name: 'Dai Stablecoin v1.0',
      symbol: 'DAI',
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      numData: {
        decimals: 18,
        amount: 10000 * Math.pow(10, 18),
      },
      verified: true,
    },
  ]

  const [proposalPanel, setProposalPanel] = useState(false)

  return (
    <Main assetsUrl="./">
      <>
        <AppHeader
          heading="Conviction Voting"
          action1={
            <Button
              mode="strong"
              label="Create proposal"
              onClick={() => setProposalPanel(true)}
            >
              Create proposal
            </Button>
          }
        />
        <Wrapper>
          <div css="width: 25%; margin-right: 1rem;">
            <Box heading="Vault balance">
              <Balances balances={balances} />
            </Box>
            {myStake && (
              <Box heading="My conviction proposal">
                <ProposalInfo
                  {...proposals.filter(({ id }) => id === myStake.proposal)[0]}
                  myStake={myStake}
                />
              </Box>
            )}
          </div>
          <div css="width: 75%">
            <DataView
              fields={[
                { label: 'Proposal', priority: 1 },
                { label: 'Requested', priority: 4 },
                { label: 'Conviction progress', priority: 2 },
              ]}
              entries={proposals}
              renderEntry={proposal => [
                <IdAndTitle {...proposal} theme={theme} />,
                <Amount {...proposal} />,
                <ConvictionBar {...proposal} theme={theme} />,
              ]}
              renderEntryExpansion={proposal => (
                <ProposalDetail
                  {...proposal}
                  onStake={() => api.stakeAllToProposal(proposal.id)}
                  onWithdraw={() => api.widthdrawAllFromProposal(proposal.id)}
                  isStaked={myStake && proposal.id === myStake.proposal}
                />
              )}
            />
          </div>
        </Wrapper>
        <SidePanel
          title="Create proposal"
          opened={proposalPanel}
          onClose={() => setProposalPanel(false)}
        >
          <AddProposalPanel
            onSubmit={({ title, description, amount, beneficiary }) => {
              api.addProposal(title, amount, beneficiary)
              // TODO Store description on IPFS
              setProposalPanel(false)
            }}
          />
        </SidePanel>
      </>
    </Main>
  )
}

const IdAndTitle = ({ id, name, description, theme }) => (
  <div>
    <Text color={theme.surfaceContent}>#{id}</Text>{' '}
    <Text color={theme.surfaceContentSecondary}>{name}</Text>
    <br />
    <Text color={theme.surfaceContentSecondary}>{description}</Text>
  </div>
)

const Amount = ({ requestedAmount = 0, requestedToken = 'DAI' }) => (
  <div>
    <BalanceToken
      amount={parseInt(requestedAmount)}
      symbol={requestedToken}
      verified
    />
  </div>
)

const ConvictionBar = ({ stakedConviction, neededConviction, theme }) => (
  <div>
    <SummaryBar
      positiveSize={stakedConviction}
      requiredSize={neededConviction}
    />
    <div>
      <Text color={theme.surfaceContent}>
        {Math.round(stakedConviction * 100)}%
      </Text>{' '}
      <Text color={theme.surfaceContentSecondary}>
        ({Math.round(neededConviction * 100)}% conviction needed)
      </Text>
    </div>
  </div>
)

const ProposalInfo = props => {
  const theme = useTheme()
  return (
    <div>
      <IdAndTitle {...props} theme={theme} />
      <Badge>{`✓ Voted with ${props.myStake.tokensStaked} TKN`}</Badge>
      <ConvictionBar {...props} theme={theme} />
    </div>
  )
}

const Wrapper = styled.div`
  display: flex;
`

export default App
