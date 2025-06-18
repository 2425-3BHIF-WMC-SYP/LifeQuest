import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Network, DataSet, Data, Options } from 'vis-network/standalone';
import {getUserId} from '../jwtToken';
import { ThoughtCategory, ThoughtNetworkData, ThoughtNode, ThoughtEdge } from '../types';

@Component({
  selector: 'app-thought-network',
  standalone: true,
  imports: [],
  templateUrl: './thought-network.component.html',
  styleUrl: './thought-network.component.css'
})
export class ThoughtNetworkComponent implements OnInit {
  @ViewChild('networkContainer', { static: true }) containerRef!: ElementRef;

  token = localStorage.getItem('token');
  userId = this.token ? getUserId(this.token) : null;
  network: Network | null = null;
  nodes: DataSet<ThoughtNode> | null = null;
  edges: DataSet<ThoughtEdge> | null = null;
  selectedNodeId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadThoughtNetwork();
  }

  loadThoughtNetwork(): void {
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }
    this.http.get<ThoughtNetworkData>(`http://localhost:3000/thoughts/graph/${this.userId}`).subscribe({
      next: (data: ThoughtNetworkData) => {
        this.nodes = new DataSet<ThoughtNode>(data.nodes);
        this.edges = new DataSet<ThoughtEdge>(data.edges);

        const container = this.containerRef.nativeElement;
        const networkData: Data = {
          nodes: this.nodes,
          edges: this.edges
        };

        const options: Options = {
          nodes: {
            shape: 'dot',
            size: 16,
            font: { color: '#ffffff', size: 12 },
            borderWidth: 2,
            shadow: true
          },
          groups: {
            Idee: { color: { background: '#00bfa6', border: '#00897b' } },
            Konzept: { color: { background: '#a3e4ff', border: '#0288d1' } },
            Frage: { color: { background: '#ff8c00', border: '#f57c00' } },
            Theorie: { color: { background: '#ff4d4d', border: '#d32f2f' } }
          },
          edges: {
            color: '#888',
            arrows: 'to',
            smooth: {
              enabled: true,
              type: 'continuous',
              roundness: 0.5
            }
          },
          physics: {
            stabilization: false,
            barnesHut: {
              gravitationalConstant: -2000,
              centralGravity: 0.3,
              springLength: 95,
              springConstant: 0.04,
              damping: 0.09
            }
          },
          interaction: {
            hover: true,
            tooltipDelay: 200
          }
        };

        this.network = new Network(container, networkData, options);
        this.network.on('click', (event) => {
          if (event.nodes.length > 0) {
            console.log('Clicked node:', event.nodes[0]);
            if (event.nodes.length === 1) {
              const clickedNodeId = event.nodes[0];
              if (this.selectedNodeId === null) {
                this.selectedNodeId = clickedNodeId;
              } else if (this.selectedNodeId !== clickedNodeId) {
                this.edges?.add({
                  from: this.selectedNodeId,
                  to: clickedNodeId
                });
                this.selectedNodeId = null;
              } else {
                this.selectedNodeId = null;
              }
            }
          }
        });
      },
      error: (error) => {
        console.error('Error loading thought network:', error);
      }
    });
  }
}
